import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { dbReadonly } from "@/server/db-readonly";
import { TRPCError } from "@trpc/server";

export const inventoryRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // listarUnidadesComVolumes
  // Retorna unidades com volumes ativos (minuta ativa) nos últimos 90 dias.
  // no_patio   → última bipagem = desembarque (picking.tipo=2) na unidade
  // em_viagem  → última bipagem = embarque (picking.tipo=1) + manifesto em rota
  //              exibidos na unidade de DESTINO
  // ---------------------------------------------------------------------------
  listarUnidadesComVolumes: publicProcedure.query(async ({ ctx }) => {
    const rows = await dbReadonly`
      -- Obtém o ÚLTIMO movimento real de cada barra (mesmo critério do fecharInventario)
      -- para garantir que os números do painel coincidam com os do relatório.
      WITH UltimaMovimentacao AS (
        SELECT DISTINCT ON (h.barra)
          h.barra,
          p.unidade        AS picking_unidade,
          p.tipo           AS picking_tipo,
          m.status         AS minuta_status,
          man.status       AS manifesto_status
        FROM historico_volume h
        INNER JOIN picking   p   ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
        INNER JOIN volumes   v   ON h.id_volume  = v.id_volume
        INNER JOIN minuta    m   ON v.id_minuta  = m.id_minuta
        LEFT  JOIN manifesto man ON h.manifesto  = man.id_manifesto
        WHERE h.data >= NOW() - INTERVAL '90 days'
          AND m.status NOT IN (6, 13)
          AND m.cte_numero != 0
        ORDER BY h.barra, h.id DESC  -- Pega o último registro de cada barra (igual ao fecharInventario)
      )
      SELECT
        u.id_unidade,
        u.fantasia,
        u.sigla,
        COUNT(*)                                                          AS total_volumes,
        COUNT(*) FILTER (WHERE d.picking_tipo = 2)                       AS no_patio,
        COUNT(*) FILTER (WHERE d.picking_tipo = 1
                           AND d.manifesto_status = 2)                   AS em_viagem
      FROM UltimaMovimentacao d
      INNER JOIN unidades u ON u.id_unidade = d.picking_unidade
      WHERE u.status = 1
        AND d.picking_tipo = 2  -- Exibe apenas volumes cujo último mov. foi desembarque (no pátio)
                                 -- ou em viagem; excluímos os que já saíram definitivamente
      GROUP BY u.id_unidade, u.fantasia, u.sigla
      HAVING COUNT(*) > 0
      ORDER BY COUNT(*) DESC
    `;

    const unidades = rows.map((r) => ({
      id_unidade:    Number(r.id_unidade),
      fantasia:      r.fantasia as string,
      sigla:         r.sigla as string,
      total_volumes: Number(r.total_volumes),
      no_patio:      Number(r.no_patio),
      em_viagem:     Number(r.em_viagem),
      itens_bipados: 0, // Placeholder, será preenchido abaixo
      status_inventario: "AGUARDANDO",
    }));

    // Buscar os inventários mais recentes de cada unidade
    const inventariosDb = await ctx.db.inventario.findMany({
      where: {
        unidade_id: { in: unidades.map(u => u.id_unidade) }
      },
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: {
          select: { itens: true }
        }
      }
    });

    // Pega só o inventário mais recente por unidade
    const ultimosInventarios = new Map<number, typeof inventariosDb[0]>();
    for (const inv of inventariosDb) {
      if (!ultimosInventarios.has(inv.unidade_id)) {
        ultimosInventarios.set(inv.unidade_id, inv);
      }
    }

    // Preenche os dados de progresso e status
    return unidades.map(u => {
      const inv = ultimosInventarios.get(u.id_unidade);
      if (inv) {
        u.status_inventario = inv.status === "ABERTO" ? "EM_ANDAMENTO" : "CONCLUIDO";
        u.itens_bipados = inv._count.itens;
      }
      return u;
    });
  }),

  // -------------------------------------------------------------------------
  // buscarNomeUnidade
  // Retorna fantasia e sigla de uma unidade pelo id.
  // Usado nas telas de bipagem e relatório para exibir o nome no cabeçalho.
  // -------------------------------------------------------------------------
  buscarNomeUnidade: publicProcedure
    .input(z.object({ unidade_id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const rows = await dbReadonly`
        SELECT id_unidade, fantasia, sigla
        FROM unidades
        WHERE id_unidade = ${input.unidade_id}
        LIMIT 1
      `;
      if (!rows[0]) return null;
      return {
        id_unidade: Number(rows[0].id_unidade),
        fantasia:   rows[0].fantasia as string,
        sigla:      rows[0].sigla as string,
      };
    }),

  // -------------------------------------------------------------------------
  // listarUnidadesSimples
  // Retorna a lista completa de unidades ativas para uso em filtros (ex: Histórico).
  // -------------------------------------------------------------------------
  listarUnidadesSimples: publicProcedure.query(async () => {
    const rows = await dbReadonly`
      SELECT id_unidade, fantasia, sigla 
      FROM unidades 
      WHERE status = 1 
      ORDER BY fantasia ASC
    `;
    return rows.map(r => ({
      id: Number(r.id_unidade),
      fantasia: r.fantasia as string,
      sigla: r.sigla as string,
    }));
  }),

  processarBipagemDiaria: publicProcedure
    .input(
      z.object({
        inventarioId: z.string(),
        codigoBarra: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Buscar o inventário atual no Prisma para descobrir a unidade
      const inventario = await ctx.db.inventario.findUnique({
        where: { id: input.inventarioId },
      });

      if (!inventario) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inventário não encontrado.",
        });
      }

      const unidadeAtual = inventario.unidade_id;

      // 2. Buscar o último registro desse código de barras no banco legado
      // JOIN com picking filtrando pelo mesmo tipo da movimentação,
      // para garantir que pegamos o desembarque/embarque correto.
      const rows = await dbReadonly`
        SELECT DISTINCT ON (h.barra)
          h.barra,
          p.unidade       AS unidade_teorica,
          p.tipo          AS tipo_picking,
          v.id_minuta,
          h.manifesto     AS id_manifesto,
          m.status        AS minuta_status,
          m.prev_entrega,
          COALESCE(
            (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
            m.origem
          )               AS origem_nome,
          COALESCE(
            (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
            m.destino
          )               AS destino_nome
        FROM historico_volume h
        INNER JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
        INNER JOIN volumes v ON h.id_volume = v.id_volume
        INNER JOIN minuta m ON v.id_minuta = m.id_minuta
        WHERE h.barra = ${input.codigoBarra}
          AND m.cte_numero != 0
        ORDER BY h.barra, h.id DESC
      `;

      const ultimoRegistro = rows[0];

      // 3. Determinar o status da auditoria baseado na regra de negócio
      // Minuta finalizada (6) ou cancelada (13) = possível extravio
      // Última bipagem = desembarque nessa unidade + minuta ativa = encontrado correto
      // Qualquer outra situação = sobra na base
      let statusAuditoria = "SOBRA_NA_BASE";
      const minutaStatus = ultimoRegistro ? Number(ultimoRegistro.minuta_status) : null;

      if (ultimoRegistro) {
        if (minutaStatus === 6 || minutaStatus === 13) {
          statusAuditoria = "POSSIVEL_EXTRAVIO";
        } else {
          const isDesembarque = Number(ultimoRegistro.tipo_picking) === 2;
          const isMesmaUnidade = Number(ultimoRegistro.unidade_teorica) === unidadeAtual;

          if (isDesembarque && isMesmaUnidade) {
            statusAuditoria = "ENCONTRADO_CORRETO";
          }
        }
      }

      // 4. Verificar duplicata — mesmo código já bipado neste inventário
      const itemExistente = await ctx.db.itemInventario.findFirst({
        where: {
          inventario_id: input.inventarioId,
          codigo_barra:  input.codigoBarra,
        },
      });

      if (itemExistente) {
        // Retorna sem salvar; o frontend exibe aviso de duplicata
        return {
          success:   false,
          duplicado: true,
          item:      itemExistente,
          detalhe:   null,
          info: {
            unidadeAtual,
            unidadeTeorica:       null,
            tipoPicking:          null,
            foiEncontradoCorreto: false,
            ehExtravio:           false,
          },
        };
      }

      // 5. Salvar o item bipado no banco (Prisma)
      const item = await ctx.db.itemInventario.create({
        data: {
          inventario_id: input.inventarioId,
          codigo_barra:  input.codigoBarra,
          status_auditoria: statusAuditoria,
        },
      });

      // 6. Retornar o resultado para o frontend
      return {
        success:   true,
        duplicado: false,
        item,
        detalhe: ultimoRegistro ? {
          id_minuta:     ultimoRegistro.id_minuta ? Number(ultimoRegistro.id_minuta) : null,
          id_manifesto:  ultimoRegistro.id_manifesto ? Number(ultimoRegistro.id_manifesto) : null,
          prev_entrega:  ultimoRegistro.prev_entrega as string | null,
          origem_nome:   ultimoRegistro.origem_nome as string | null,
          destino_nome:  ultimoRegistro.destino_nome as string | null,
          minuta_status: minutaStatus,
        } : null,
        info: {
          unidadeAtual,
          unidadeTeorica: ultimoRegistro ? Number(ultimoRegistro.unidade_teorica) : null,
          tipoPicking:    ultimoRegistro ? Number(ultimoRegistro.tipo_picking) : null,
          foiEncontradoCorreto: statusAuditoria === "ENCONTRADO_CORRETO",
          ehExtravio:           statusAuditoria === "POSSIVEL_EXTRAVIO",
        },
      };
    }),

  removerItem: publicProcedure
    .input(z.object({ itemId: z.string(), inventarioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Garante que o inventário ainda está aberto
      const inventario = await ctx.db.inventario.findUnique({
        where: { id: input.inventarioId },
        select: { status: true },
      });

      if (inventario?.status !== "ABERTO") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Inventário já foi finalizado. Não é possível remover itens.",
        });
      }

      await ctx.db.itemInventario.delete({
        where: { id: input.itemId },
      });

      return { success: true };
    }),

  listarItensDoInventario: publicProcedure
    .input(z.object({ inventarioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const itens = await ctx.db.itemInventario.findMany({
        where: { inventario_id: input.inventarioId },
        orderBy: { criadoEm: "desc" },
      });

      if (itens.length === 0) return [];

      const barcodes = itens.map((i) => i.codigo_barra);

      const detalhes = await dbReadonly`
        SELECT DISTINCT ON (h.barra)
          h.barra,
          v.id_minuta,
          m.total_volumes
        FROM historico_volume h
        INNER JOIN volumes v ON h.id_volume = v.id_volume
        INNER JOIN minuta m ON v.id_minuta = m.id_minuta
        WHERE h.barra = ANY(${barcodes})
        ORDER BY h.barra, h.id DESC
      `;

      const detalheMap = new Map(
        detalhes.map((d) => [
          String(d.barra),
          {
            id_minuta: d.id_minuta ? Number(d.id_minuta) : null,
            total_volumes: d.total_volumes ? Number(d.total_volumes) : null,
          },
        ])
      );

      return itens.map((item) => {
        const d = detalheMap.get(item.codigo_barra);
        return {
          ...item,
          id_minuta: d?.id_minuta ?? null,
          total_volumes: d?.total_volumes ?? null,
        };
      });
    }),

  listarInventarios: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.inventario.findMany({
        orderBy: { criadoEm: "desc" },
        include: {
          _count: {
            select: { itens: true },
          },
        },
      });
    }),

  criarInventario: publicProcedure
    .input(z.object({ 
      unidade_id: z.number().int().positive(),
      praca: z.string().optional(),
      praca_label: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const novoInventario = await ctx.db.inventario.create({
        data: {
          unidade_id: input.unidade_id,
          praca: input.praca,
          praca_label: input.praca_label,
          status: "ABERTO",
        },
      });
      return { id: novoInventario.id };
    }),

  fecharInventario: publicProcedure
    .input(z.object({ inventarioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Validar e buscar a unidade do inventário
      const inventario = await ctx.db.inventario.findUnique({
        where: { id: input.inventarioId },
      });

      if (!inventario) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inventário não encontrado.",
        });
      }

      if (inventario.status === "CONCLUIDO") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este inventário já está fechado.",
        });
      }

      const unidadeId = inventario.unidade_id;

      // 2. Buscar todos os itens bipados neste inventário (apenas códigos de barras)
      const itensBipados = await ctx.db.itemInventario.findMany({
        where: { inventario_id: input.inventarioId },
        select: { codigo_barra: true },
      });

      const setBipados = new Set(itensBipados.map((i) => i.codigo_barra));

      // 3. Consulta no banco legado: volumes que DEVERIAM estar nessa unidade
      // Regras:
      //   - Última movimentação = DESEMBARQUE (picking.tipo = 2) nessa unidade
      //   - Minuta ativa (não finalizada nem cancelada: status != 6, 13)
      //   - Janela de 90 dias para não varrer o histórico inteiro
      const pracaFilter = inventario.praca 
        ? inventario.praca === "SEM_PRACA"
          ? dbReadonly`AND (praca IS NULL OR praca = '')`
          : dbReadonly`AND praca = ${inventario.praca}`
        : dbReadonly``;

      const teoricos = await dbReadonly`
        -- Obtém a última movimentação de cada barra nos últimos 90 dias
        -- e verifica se esse último movimento foi DESEMBARQUE nessa unidade.
        -- Volumes que já foram embarcados após o desembarque NÃO aparecem aqui.
        SELECT barra
        FROM (
          SELECT DISTINCT ON (h.barra)
            h.barra,
            p.unidade AS picking_unidade,
            p.tipo    AS picking_tipo,
            r.praca   AS praca
          FROM historico_volume h
          INNER JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          INNER JOIN volumes  v ON h.id_volume  = v.id_volume
          INNER JOIN minuta   m ON v.id_minuta  = m.id_minuta
          LEFT JOIN rotas r ON m.rota::text = r.id::text
          WHERE h.data >= NOW() - INTERVAL '90 days'
            AND m.status NOT IN (6, 13)
            AND m.cte_numero != 0
          ORDER BY h.barra, h.id DESC  -- Pega o último registro de cada barra
        ) ultima_mov
        WHERE picking_tipo = 2                       -- Última ação = desembarque
          AND picking_unidade = ${unidadeId}         -- Nessa unidade especificamente
          ${pracaFilter}
      `;

      // 4. Reconciliação (O que deveria estar - O que foi bipado = Faltantes)
      const faltantesToInsert: {
        inventario_id: string;
        codigo_barra: string;
        status_auditoria: string;
      }[] = [];
      for (const row of teoricos) {
        const barraTeorica = String(row.barra ?? "");
        if (barraTeorica && !setBipados.has(barraTeorica)) {
          faltantesToInsert.push({
            inventario_id: input.inventarioId,
            codigo_barra: barraTeorica,
            status_auditoria: "FALTANTE",
          });
        }
      }

      // 5. Salvar os faltantes e fechar o inventário em uma transação Prisma
      await ctx.db.$transaction(async (tx) => {
        if (faltantesToInsert.length > 0) {
          await tx.itemInventario.createMany({
            data: faltantesToInsert,
          });
        }

        await tx.inventario.update({
          where: { id: input.inventarioId },
          data: { status: "CONCLUIDO" },
        });
      }, {
        timeout: 30000, // 30 segundos
      });

      return {
        success: true,
        fechado: true,
        resumo: {
          bipados: setBipados.size,
          teoricoTotal: teoricos.length,
          faltantesIdentificados: faltantesToInsert.length,
        },
      };
    }),

  obterRelatorioInventario: publicProcedure
    .input(z.object({ inventarioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const inventario = await ctx.db.inventario.findUnique({
        where: { id: input.inventarioId },
      });

      if (!inventario) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inventário não encontrado.",
        });
      }

      const itens = await ctx.db.itemInventario.findMany({
        where: { inventario_id: input.inventarioId },
      });

      let corretos  = 0;
      let sobras    = 0;
      let faltantes = 0;
      let extravios = 0;
      const divergencias: typeof itens = [];

      for (const item of itens) {
        if (item.status_auditoria === "ENCONTRADO_CORRETO") {
          corretos++;
        } else if (item.status_auditoria === "POSSIVEL_EXTRAVIO") {
          extravios++;
        } else {
          if (item.status_auditoria === "SOBRA_NA_BASE") sobras++;
          if (item.status_auditoria === "FALTANTE")      faltantes++;
        }
        divergencias.push(item);
      }

      // Enriquece as divergências com dados do banco legado
      let divergenciasEnriquecidas: (typeof itens[number] & {
        detalhe: {
          id_minuta:    number | null;
          id_manifesto: number | null;
          prev_entrega: string | null;
          origem_nome:  string | null;
          destino_nome: string | null;
          rota_nome:    string | null;
          praca:        string | null;
          minuta_status: number | null;
          total_volumes: number | null;
        } | null;
        ultima_bipagem: {
          unidade_nome: string | null;
          unidade_sigla: string | null;
          tipo: "EMBARQUE" | "DESEMBARQUE" | null;
          data: Date | null;
        } | null;
        ultima_ocorrencia: {
          id_oco:       number | null;
          descricao:    string | null;
          data_evento:  Date | null;
        } | null;
      })[] = [];

      if (itens.length > 0) {
        const barcodesIniciais = itens.map((d) => d.codigo_barra);

        // Encontrar as minutas associadas aos itens bipados
        const minutasIniciais = await dbReadonly`
          SELECT DISTINCT v.id_minuta
          FROM historico_volume h
          INNER JOIN volumes v ON h.id_volume = v.id_volume
          WHERE h.barra = ANY(${barcodesIniciais})
        `;

        const minutaIdsIniciais = minutasIniciais.map(m => Number(m.id_minuta)).filter(Boolean);

        // Obter todas as barras dessas minutas
        const todasBarras = minutaIdsIniciais.length > 0 ? await dbReadonly`
          SELECT 
            (SELECT h.barra FROM historico_volume h WHERE h.id_volume = v.id_volume ORDER BY h.id DESC LIMIT 1) as barra
          FROM volumes v
          WHERE v.id_minuta = ANY(${minutaIdsIniciais})
        ` : [];

        const allBarcodesSet = new Set<string>(barcodesIniciais);
        for (const b of todasBarras) {
          if (b.barra) allBarcodesSet.add(String(b.barra));
        }

        const allBarcodes = Array.from(allBarcodesSet);

        const detalhes = await dbReadonly`
          SELECT DISTINCT ON (h.barra)
            h.barra,
            h.manifesto       AS id_manifesto,
            v.id_minuta,
            m.prev_entrega,
            COALESCE(
              ro.rota,
              (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
              m.origem
            )                 AS origem_nome,
            COALESCE(
              rd.rota,
              (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
              m.destino
            )                 AS destino_nome,
            r.rota            AS rota_nome,
            rd.praca          AS praca,
            m.status          AS minuta_status,
            m.total_volumes   AS total_volumes,
            m.cte_numero      AS cte_numero
          FROM historico_volume h
          INNER JOIN volumes v ON h.id_volume  = v.id_volume
          INNER JOIN minuta  m ON v.id_minuta  = m.id_minuta
          LEFT JOIN rotas r ON m.rota::text = r.id::text
          LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
          LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
          WHERE h.barra = ANY(${allBarcodes})
          ORDER BY h.barra, h.id DESC
        `;

        const detalheMap = new Map(
          detalhes.map((d) => [
            String(d.barra),
            {
              id_minuta:     d.id_minuta     ? Number(d.id_minuta)     : null,
              id_manifesto:  d.id_manifesto  ? Number(d.id_manifesto)  : null,
              prev_entrega:  d.prev_entrega  as string | null,
              origem_nome:   d.origem_nome   as string | null,
              destino_nome:  d.destino_nome  as string | null,
              rota_nome:     d.rota_nome     as string | null,
              praca:         d.praca         as string | null,
              minuta_status: d.minuta_status ? Number(d.minuta_status) : null,
              total_volumes: d.total_volumes ? Number(d.total_volumes) : null,
              cte_zero:      String(d.cte_numero ?? '') === '0',
            },
          ])
        );

        const ultimasBipagens = await dbReadonly`
          SELECT DISTINCT ON (h.barra)
            h.barra,
            h.data,
            p.tipo   AS tipo_picking,
            u.fantasia AS unidade_nome,
            u.sigla    AS unidade_sigla
          FROM historico_volume h
          INNER JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          INNER JOIN unidades u ON u.id_unidade = p.unidade
          WHERE h.barra = ANY(${allBarcodes})
          ORDER BY h.barra, h.id DESC
        `;

        const bipagensMap = new Map(
          ultimasBipagens.map((b) => [
            String(b.barra),
            {
              unidade_nome:  b.unidade_nome  as string | null,
              unidade_sigla: b.unidade_sigla as string | null,
              tipo: Number(b.tipo_picking) === 2 ? "DESEMBARQUE" as const : "EMBARQUE" as const,
              data: b.data ? new Date(b.data as string | number | Date) : null,
            },
          ])
        );

        const minutaIds = detalhes
          .map((d) => d.id_minuta ? Number(d.id_minuta) : null)
          .filter((id): id is number => id !== null);

        const ocorrencias = minutaIds.length > 0
          ? await dbReadonly`
              SELECT DISTINCT ON (f.frete)
                f.frete as id_minuta,
                f.status as id_oco,
                t.descricao AS descricao,
                f.created_at as data_evento
              FROM frete_hist f
              LEFT JOIN tipo_oco t ON t.id_oco = f.status
              WHERE f.frete = ANY(${minutaIds})
                AND f.status > 0
              ORDER BY f.frete, f.created_at DESC
            `
          : [];

        const ocorrenciasMap = new Map(
          ocorrencias.map((o) => [
            Number(o.id_minuta),
            {
              id_oco:      o.id_oco ? Number(o.id_oco) : null,
              descricao:   o.descricao ? String(o.descricao) : null,
              data_evento: o.data_evento ? new Date(o.data_evento as string | number | Date) : null,
            },
          ])
        );

        const itemMap = new Map(itens.map(i => [i.codigo_barra, i]));

        divergenciasEnriquecidas = allBarcodes.map((barra) => {
          const itemPrisma = itemMap.get(barra);
          const detalhe = detalheMap.get(barra) ?? null;
          const minutaId = detalhe?.id_minuta ?? null;
          return {
            id: itemPrisma ? itemPrisma.id : `virtual-faltante-${barra}`,
            codigo_barra: barra,
            status_auditoria: itemPrisma ? itemPrisma.status_auditoria : "FALTANTE",
            criadoEm: itemPrisma ? itemPrisma.criadoEm : new Date(),
            detalhe,
            ultima_bipagem: bipagensMap.get(barra) ?? null,
            ultima_ocorrencia: minutaId ? (ocorrenciasMap.get(minutaId) ?? null) : null,
            inventario_id: itemPrisma ? itemPrisma.inventario_id : inventario.id,
          };
        });
      }

      return {
        inventario,
        contadores: {
          corretos,
          sobras,
          faltantes,
          extravios,
          totalProcessado: corretos + sobras + faltantes + extravios,
        },
        divergencias: divergenciasEnriquecidas,
      };
    }),

  obterDashboard: publicProcedure
    .input(z.object({ data: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const hoje = new Date();
      let inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
      let fimDia = new Date(hoje.setHours(23, 59, 59, 999));

      if (input.data) {
        const [ano, mes, dia] = input.data.split('-').map(Number) as [number, number, number];
        inicioDia = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
        fimDia = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
      }

      const inventariosDb = await ctx.db.inventario.findMany({
        where: { 
          criadoEm: { gte: inicioDia, lte: fimDia }
        },
        include: {
          itens: { select: { status_auditoria: true, codigo_barra: true } },
          _count: { select: { itens: true } }
        },
        orderBy: { criadoEm: "desc" }
      });

      const inventariosNoPeriodo = inventariosDb.length;
      const unidadesHoje = Array.from(new Set(inventariosDb.map(i => i.unidade_id)));

      // Para andamento dos inventarios (todas as praças da unidade)
      const pracasAtivas = unidadesHoje.length > 0 ? await dbReadonly`
        WITH UltimaMov AS (
          SELECT DISTINCT ON (h.barra)
             h.barra, p.unidade AS picking_unidade, p.tipo AS picking_tipo, r.praca
          FROM historico_volume h
          INNER JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          INNER JOIN volumes v ON h.id_volume = v.id_volume
          INNER JOIN minuta m ON v.id_minuta = m.id_minuta
          LEFT JOIN rotas r ON m.rota::text = r.id::text
          WHERE h.data >= NOW() - INTERVAL '90 days'
            AND m.status NOT IN (6, 13) AND m.cte_numero != 0
            AND p.unidade = ANY(${unidadesHoje})
          ORDER BY h.barra, h.id DESC
        )
        SELECT picking_unidade, praca
        FROM UltimaMov
        WHERE picking_tipo = 2
        GROUP BY picking_unidade, praca
      ` : [];

      const pracasPorUnidade = new Map<number, Set<string>>();
      pracasAtivas.forEach(p => {
         const id = Number(p.picking_unidade);
         const set = pracasPorUnidade.get(id) ?? new Set();
         set.add((p.praca as string) ?? 'SEM_PRACA');
         pracasPorUnidade.set(id, set);
      });

      let inventariosConcluidos = 0;
      let inventariosEmAndamento = 0;

      for (const unid of unidadesHoje) {
         const invs = inventariosDb.filter(i => i.unidade_id === unid);
         const hasAberto = invs.some(i => i.status === "ABERTO");
         const concluidosPracas = new Set(invs.filter(i => i.status === "CONCLUIDO").map(i => i.praca_label || 'SEM_PRACA'));
         
         const totalPracasAtivas = pracasPorUnidade.get(unid)?.size ?? 1;

         if (hasAberto) {
            inventariosEmAndamento++;
         } else if (concluidosPracas.size >= totalPracasAtivas) {
            inventariosConcluidos++;
         } else if (concluidosPracas.size > 0) {
            inventariosEmAndamento++;
         }
      }

      // ==========================================
      // LÓGICA DE DIVERGÊNCIA (MATEMÁTICA / VIRTUAL)
      // ==========================================
      // A página de relatório calcula os faltantes "virtualmente" buscando o total
      // de volumes da minuta no banco legado. Se a quantidade de itens bipados
      // for menor que o total de volumes da minuta, então a minuta é divergente.
      const todosBarcodes = inventariosDb.flatMap(inv => inv.itens.map(i => i.codigo_barra));

      let barcodeParaMinuta = new Map<string, number>();
      let minutasUnicasEncontradas = new Set<number>();

      if (todosBarcodes.length > 0) {
        const detalhesBarcodes = await dbReadonly`
          SELECT DISTINCT ON (h.barra)
            h.barra,
            v.id_minuta
          FROM historico_volume h
          INNER JOIN volumes v ON h.id_volume = v.id_volume
          WHERE h.barra = ANY(${todosBarcodes})
          ORDER BY h.barra, h.id DESC
        `;

        for (const row of detalhesBarcodes) {
          if (row.id_minuta) {
            barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
            minutasUnicasEncontradas.add(Number(row.id_minuta));
          }
        }
      }

      // Descobrir o total absoluto de volumes de cada minuta
      let totaisPorMinuta = new Map<number, number>();
      if (minutasUnicasEncontradas.size > 0) {
        const arrayMinutas = Array.from(minutasUnicasEncontradas);
        const contagemVolumes = await dbReadonly`
          SELECT id_minuta, COUNT(id_volume) as total_volumes
          FROM volumes
          WHERE id_minuta = ANY(${arrayMinutas})
          GROUP BY id_minuta
        `;

        for (const row of contagemVolumes) {
          totaisPorMinuta.set(Number(row.id_minuta), Number(row.total_volumes));
        }
      }

      // 3. Processar cada inventário do dia
      let totalItensConferidos = 0;
      const minutasComDivergenciaGeral = new Set<number>();
      const inventariosDoDia = [];

      for (const inv of inventariosDb) {
        let lidosDoInv = 0;
        const bipadosPorMinuta = new Map<number, number>();

        for (const item of inv.itens) {
          // Apenas contabiliza os itens reais bipados (ignoramos os faltantes salvos, se houver)
          if (item.status_auditoria !== "FALTANTE") {
            lidosDoInv++;
            totalItensConferidos++;
            
            const mId = barcodeParaMinuta.get(String(item.codigo_barra));
            if (mId) {
              bipadosPorMinuta.set(mId, (bipadosPorMinuta.get(mId) || 0) + 1);
            }
          }
        }

        // Calcular divergência matemática: se bipou menos que o total da minuta -> divergência
        let divergenciasDoInv = 0;
        for (const [mId, qtdBipada] of bipadosPorMinuta.entries()) {
          const totalDaMinuta = totaisPorMinuta.get(mId) || 0;
          if (qtdBipada > 0 && qtdBipada < totalDaMinuta) {
            divergenciasDoInv++;
            minutasComDivergenciaGeral.add(mId);
          }
        }

        inventariosDoDia.push({
          id: inv.id,
          unidade_id: inv.unidade_id,
          status: inv.status,
          bipados: lidosDoInv,
          divergencias: divergenciasDoInv,
          praca: inv.praca_label
        });
      }

      const divergenciasAbertas = minutasComDivergenciaGeral.size;

      // Unidades sigla para Atividade Recente
      const siglaMap = new Map<number, string>();
      if (unidadesHoje.length > 0) {
         const uns = await dbReadonly`SELECT id_unidade, sigla FROM unidades WHERE id_unidade = ANY(${unidadesHoje})`;
         uns.forEach(u => siglaMap.set(Number(u.id_unidade), String(u.sigla)));
      }

      const atividadeRecente = inventariosDb.slice(0, 5).map(inv => {
        const lidos = inv.itens.filter(i => i.status_auditoria !== "FALTANTE").length;
        return {
          id: inv.id,
          unidade_id: inv.unidade_id,
          sigla: siglaMap.get(inv.unidade_id) ?? `Unid. ${inv.unidade_id}`,
          status: inv.status,
          criadoEm: inv.criadoEm,
          itens: lidos,
          praca: inv.praca_label
        };
      });

      // ==========================================
      // Resumo de Conferência: minutas divergentes por dia do mês atual
      // Usa a MESMA LÓGICA MATEMÁTICA
      // ==========================================
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const invHistoricosMes = await ctx.db.inventario.findMany({
        where: { criadoEm: { gte: inicioMes } },
        include: { itens: { select: { status_auditoria: true, codigo_barra: true } } }
      });

      const todosMesBarcodes = invHistoricosMes.flatMap(inv => inv.itens.map(i => i.codigo_barra));

      let barcodeMesMinutaMap = new Map<string, number>();
      let minutasUnicasMes = new Set<number>();

      if (todosMesBarcodes.length > 0) {
        const detalhes = await dbReadonly`
          SELECT DISTINCT ON (h.barra) h.barra, v.id_minuta
          FROM historico_volume h
          INNER JOIN volumes v ON h.id_volume = v.id_volume
          WHERE h.barra = ANY(${todosMesBarcodes})
          ORDER BY h.barra, h.id DESC
        `;
        
        for (const row of detalhes) {
          if (row.id_minuta) {
            barcodeMesMinutaMap.set(String(row.barra), Number(row.id_minuta));
            minutasUnicasMes.add(Number(row.id_minuta));
          }
        }
      }

      let totaisMesPorMinuta = new Map<number, number>();
      if (minutasUnicasMes.size > 0) {
        const arrayMinutasMes = Array.from(minutasUnicasMes);
        const contagemMes = await dbReadonly`
          SELECT id_minuta, COUNT(id_volume) as total_volumes
          FROM volumes
          WHERE id_minuta = ANY(${arrayMinutasMes})
          GROUP BY id_minuta
        `;
        for (const row of contagemMes) {
          totaisMesPorMinuta.set(Number(row.id_minuta), Number(row.total_volumes));
        }
      }

      const diasMap = new Map<number, Set<number>>();
      for (const inv of invHistoricosMes) {
        const dia = inv.criadoEm.getDate();
        const minutasSet = diasMap.get(dia) ?? new Set<number>();
        
        const bipadosPorMinutaMes = new Map<number, number>();

        for (const item of inv.itens) {
          if (item.status_auditoria !== "FALTANTE") {
            const mId = barcodeMesMinutaMap.get(String(item.codigo_barra));
            if (mId) {
              bipadosPorMinutaMes.set(mId, (bipadosPorMinutaMes.get(mId) || 0) + 1);
            }
          }
        }

        // Se bipou menos que o total -> divergência
        for (const [mId, qtdBipada] of bipadosPorMinutaMes.entries()) {
          const totalDaMinuta = totaisMesPorMinuta.get(mId) || 0;
          if (qtdBipada > 0 && qtdBipada < totalDaMinuta) {
            minutasSet.add(mId);
          }
        }

        diasMap.set(dia, minutasSet);
      }

      const resumoConferencia = [];
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      const limite = (hoje.getMonth() === inicioDia.getMonth() && hoje.getFullYear() === inicioDia.getFullYear()) ? hoje.getDate() : ultimoDiaMes;
      
      for (let i = 1; i <= limite; i++) {
         resumoConferencia.push({
            dia: i,
            divergencias: diasMap.get(i)?.size ?? 0
         });
      }

      return {
        kpis: {
          inventariosNoPeriodo,
          inventariosEmAndamento,
          inventariosConcluidos,
          divergenciasAbertas,
          itensConferidos: totalItensConferidos,
        },
        atividadeRecente,
        resumoConferencia,
        inventariosDoDia
      };
    }),

  // -------------------------------------------------------------------------
  // listarHistorico
  // Busca inventários passados com filtros e paginação
  // -------------------------------------------------------------------------
  listarHistorico: publicProcedure
    .input(z.object({
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      unidade_id: z.number().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const where: {
        unidade_id?: number;
        criadoEm?: {
          gte?: Date;
          lte?: Date;
        };
      } = {};
      
      if (input.unidade_id) {
        where.unidade_id = input.unidade_id;
      }

      if (input.dataInicio || input.dataFim) {
        where.criadoEm = {};
        if (input.dataInicio) {
          const [ano, mes, dia] = input.dataInicio.split('-').map(Number) as [number, number, number];
          where.criadoEm.gte = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
        }
        if (input.dataFim) {
          const [ano, mes, dia] = input.dataFim.split('-').map(Number) as [number, number, number];
          where.criadoEm.lte = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
        }
      }

      const totalCount = await ctx.db.inventario.count({ where });

      const inventariosDb = await ctx.db.inventario.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          itens: { select: { status_auditoria: true } },
          _count: { select: { itens: true } }
        }
      });

      const items = inventariosDb.map(inv => {
        let corretos = 0;
        let divergentes = 0;
        let extravios = 0;

        for (const item of inv.itens) {
          if (item.status_auditoria === "ENCONTRADO_CORRETO") corretos++;
          else divergentes++;
          if (item.status_auditoria === "POSSIVEL_EXTRAVIO") extravios++;
        }

        return {
          id: inv.id,
          unidade_id: inv.unidade_id,
          status: inv.status,
          criadoEm: inv.criadoEm,
          atualizadoEm: inv.atualizadoEm,
          bipados: inv._count.itens,
          corretos,
          divergentes,
          extravios,
        };
      });

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / input.pageSize),
        currentPage: input.page
      };
    }),

  // -------------------------------------------------------------------------
  // obterStatusPracasDia
  // -------------------------------------------------------------------------
  obterStatusPracasDia: publicProcedure
    .input(z.object({ unidade_id: z.number().int().positive(), data: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Get all active volumes grouped by praca
      const rows = await dbReadonly`
        WITH UltimaMovimentacao AS (
          SELECT DISTINCT ON (h.barra)
            h.barra,
            p.unidade        AS picking_unidade,
            p.tipo           AS picking_tipo,
            r.praca          AS praca
          FROM historico_volume h
          INNER JOIN picking   p   ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          INNER JOIN volumes   v   ON h.id_volume  = v.id_volume
          INNER JOIN minuta    m   ON v.id_minuta  = m.id_minuta
          LEFT JOIN rotas r ON m.rota::text = r.id::text
          WHERE h.data >= NOW() - INTERVAL '90 days'
            AND m.status NOT IN (6, 13)
            AND m.cte_numero != 0
          ORDER BY h.barra, h.id DESC
        )
        SELECT
          COALESCE(praca, 'SEM_PRACA') as praca,
          COUNT(*) as no_patio
        FROM UltimaMovimentacao
        WHERE picking_tipo = 2
          AND picking_unidade = ${input.unidade_id}
        GROUP BY COALESCE(praca, 'SEM_PRACA')
        ORDER BY praca ASC
      `;

      // Get inventories for today for this unit
      const hoje = new Date();
      let inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
      let fimDia = new Date(hoje.setHours(23, 59, 59, 999));
      if (input.data) {
        const [ano, mes, dia] = input.data.split('-').map(Number) as [number, number, number];
        inicioDia = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
        fimDia = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
      }

      const inventariosDb = await ctx.db.inventario.findMany({
        where: { 
          unidade_id: input.unidade_id,
          criadoEm: { gte: inicioDia, lte: fimDia }
        },
        orderBy: { criadoEm: "desc" }
      });

      type PracaEntry = {
        praca: string;
        praca_label: string;
        no_patio: number;
        inventario: { id: string; status: string } | null;
      };

      const pracasMap = new Map<string, PracaEntry>();
      for (const row of rows) {
        const pracaId = String(row.praca);
        const inv = inventariosDb.find(i => (i.praca ?? 'SEM_PRACA') === pracaId);
        
        pracasMap.set(pracaId, {
          praca: pracaId,
          praca_label: pracaId === 'SEM_PRACA' ? 'Sem Praça' : pracaId,
          no_patio: Number(row.no_patio),
          inventario: inv ? {
            id: inv.id,
            status: inv.status
          } : null
        });
      }

      return Array.from(pracasMap.values());
    }),
});
