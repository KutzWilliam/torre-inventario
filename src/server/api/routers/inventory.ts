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

  // -------------------------------------------------------------------------
  // listarPracas
  // Retorna todas as praças distintas disponíveis na tabela rotas (legado),
  // ordenadas alfabeticamente. Usado no modal de seleção de praça.
  // -------------------------------------------------------------------------
  listarPracas: publicProcedure.query(async () => {
    const rows = await dbReadonly`
      SELECT DISTINCT praca
      FROM rotas
      WHERE praca IS NOT NULL AND praca != ''
      ORDER BY praca ASC
    `;
    return rows.map(r => String(r.praca));
  }),

  // -------------------------------------------------------------------------
  // listarInventariosDaUnidade
  // Retorna todos os inventários de uma unidade, do mais recente ao mais antigo,
  // com a contagem de itens bipados. Não consulta o banco legado.
  // -------------------------------------------------------------------------
  listarInventariosDaUnidade: publicProcedure
    .input(z.object({ unidade_id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const inventarios = await ctx.db.inventario.findMany({
        where: { unidade_id: input.unidade_id },
        orderBy: { criadoEm: "desc" },
        // Conta separadamente: bipados (reais) e faltantes (inseridos no fechamento)
        include: {
          _count: {
            select: {
              itens: true,
            },
          },
        },
      });

      // Para cada inventário, conta somente os itens realmente bipados (não FALTANTE)
      // O _count acima traz o total; fazemos uma query adicional filtrada para os bipados.
      const ids = inventarios.map(i => i.id);
      const bipadosPorInventario = ids.length > 0
        ? await ctx.db.itemInventario.groupBy({
            by: ["inventario_id"],
            where: {
              inventario_id: { in: ids },
              status_auditoria: { not: "FALTANTE" },
            },
            _count: { id: true },
          })
        : [];

      const bipadosMap = new Map(bipadosPorInventario.map(r => [r.inventario_id, r._count.id]));

      return inventarios.map(inv => ({
        id:          inv.id,
        status:      inv.status,
        praca:       inv.praca ?? null,
        praca_label: inv.praca_label ?? null,
        criadoEm:    inv.criadoEm,
        totalItens:  bipadosMap.get(inv.id) ?? 0,   // apenas itens bipados reais
        totalGeral:  inv._count.itens,               // total incluindo faltantes (para referência)
      }));
    }),

  processarBipagemDiaria: publicProcedure
    .input(
      z.object({
        inventarioId: z.string(),
        // Aceita apenas códigos com exatamente 17 caracteres
        codigoBarra: z.string().length(17, "Código de barras deve ter exatamente 17 caracteres"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Buscar o inventário no Prisma
      const inventario = await ctx.db.inventario.findUnique({
        where: { id: input.inventarioId },
      });

      if (!inventario) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inventário não encontrado.",
        });
      }

      // 2. Verificar se o item já existe neste inventário no banco local (Prisma)
      const itemExistente = await ctx.db.itemInventario.findFirst({
        where: {
          inventario_id: input.inventarioId,
          codigo_barra: input.codigoBarra,
        },
      });

      if (itemExistente) {
        // Se o item estava marcado como FALTANTE (gerado ao finalizar anteriormente),
        // significa que o volume foi encontrado agora! Atualizamos para lido.
        if (itemExistente.status_auditoria === "FALTANTE") {
          const itemAtualizado = await ctx.db.itemInventario.update({
            where: { id: itemExistente.id },
            data: {
              status_auditoria: "ENCONTRADO_CORRETO",
              criadoEm: new Date(),
            },
          });

          return {
            success: true,
            duplicado: false,
            recuperadoFaltante: true,
            item: itemAtualizado,
            detalhe: null,
            info: {
              unidadeAtual: inventario.unidade_id,
              unidadeTeorica: null,
              tipoPicking: null,
              foiEncontradoCorreto: true,
              ehExtravio: false,
            },
          };
        }

        // Caso contrário, já foi bipado anteriormente como lido
        return {
          success: false,
          duplicado: true,
          recuperadoFaltante: false,
          item: itemExistente,
          detalhe: null,
          info: {
            unidadeAtual: inventario.unidade_id,
            unidadeTeorica: null,
            tipoPicking: null,
            foiEncontradoCorreto: false,
            ehExtravio: false,
          },
        };
      }

      // 3. Grava imediatamente no banco local (Prisma) sem consulta externa
      const item = await ctx.db.itemInventario.create({
        data: {
          inventario_id: input.inventarioId,
          codigo_barra: input.codigoBarra,
          status_auditoria: "ENCONTRADO_CORRETO",
        },
      });

      return {
        success: true,
        duplicado: false,
        recuperadoFaltante: false,
        item,
        detalhe: null,
        info: {
          unidadeAtual: inventario.unidade_id,
          unidadeTeorica: null,
          tipoPicking: null,
          foiEncontradoCorreto: true,
          ehExtravio: false,
        },
      };
    }),

  removerItem: publicProcedure
    .input(z.object({ itemId: z.string(), inventarioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.itemInventario.delete({
        where: { id: input.itemId },
      });

      return { success: true };
    }),

  listarItensDoInventario: publicProcedure
    .input(z.object({ inventarioId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Retorna apenas os itens lidos gravados no Prisma de forma ultra-rápida,
      // sem consultar o banco externo
      const itens = await ctx.db.itemInventario.findMany({
        where: { 
          inventario_id: input.inventarioId,
          status_auditoria: { not: "FALTANTE" },
        },
        orderBy: { criadoEm: "desc" },
      });

      return itens;
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
        return {
          success: true,
          fechado: true,
          jaEstavaFechado: true,
        };
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
        -- Obtém a última movimentação de cada barras nos últimos 90 dias
        -- via tabela volumes (primário, cobre volumes nunca bipados via historico_volume)
        -- e verifica se esse último movimento foi DESEMBARQUE nessa unidade.
        -- Volumes que já foram embarcados após o desembarque NÃO aparecem aqui.
        SELECT barras AS barra
        FROM (
          SELECT DISTINCT ON (v.barras)
            v.barras,
            p.unidade AS picking_unidade,
            p.tipo    AS picking_tipo,
            r.praca   AS praca
          FROM volumes v
          INNER JOIN historico_volume h ON h.id_volume = v.id_volume
          INNER JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          INNER JOIN minuta   m ON v.id_minuta  = m.id_minuta
          LEFT JOIN rotas r ON m.rota::text = r.id::text
          WHERE h.data >= NOW() - INTERVAL '90 days'
            AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
            AND m.status NOT IN (6, 13)
            AND m.cte_numero != 0
          ORDER BY v.barras, h.id DESC  -- Pega o último registro de cada barras
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
          parcial:      number | null;
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

        // 1. Encontrar as minutas associadas aos itens bipados
        //    PRIMÁRIO: volumes.barras (cobre todos os volumes, inclusive sem bipagem)
        //    FALLBACK: pre_minuta → historico_volume
        const minutasVolumes = await dbReadonly`
          SELECT DISTINCT v.id_minuta, v.barras AS barra
          FROM volumes v
          WHERE v.barras = ANY(${barcodesIniciais})
            AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
        `;

        const barrasAchadasVolumes = new Set(minutasVolumes.map((m) => String(m.barra)));
        const barcodesFaltantesMinuta = barcodesIniciais.filter((b) => !barrasAchadasVolumes.has(b));

        // Fallback: pre_minuta
        const minutasPreMinuta = barcodesFaltantesMinuta.length > 0
          ? await dbReadonly`
              SELECT DISTINCT pm.id_minuta, pm.malote AS barra
              FROM pre_minuta pm
              WHERE pm.malote = ANY(${barcodesFaltantesMinuta})
            `
          : [];

        const barrasAchadasPM = new Set(minutasPreMinuta.map((m) => String(m.barra)));
        const barcodesFaltantesHist = barcodesFaltantesMinuta.filter((b) => !barrasAchadasPM.has(b));

        // Fallback: historico_volume
        const minutasHistorico = barcodesFaltantesHist.length > 0
          ? await dbReadonly`
              SELECT DISTINCT v.id_minuta, h.barra
              FROM historico_volume h
              INNER JOIN volumes v ON h.id_volume = v.id_volume
              WHERE h.barra = ANY(${barcodesFaltantesHist})
            `
          : [];

        const minutaIdsIniciais = Array.from(
          new Set([
            ...minutasVolumes.map((m) => Number(m.id_minuta)).filter(Boolean),
            ...minutasPreMinuta.map((m) => Number(m.id_minuta)).filter(Boolean),
            ...minutasHistorico.map((m) => Number(m.id_minuta)).filter(Boolean),
          ])
        );

        // 2. Obter TODAS as barras dessas minutas via volumes.barras (primário)
        const barrasVolumes = minutaIdsIniciais.length > 0
          ? await dbReadonly`
              SELECT DISTINCT v.barras AS barra
              FROM volumes v
              WHERE v.id_minuta = ANY(${minutaIdsIniciais})
                AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
            `
          : [];

        // Fallback: barras do pre_minuta que não apareceram nos volumes
        const barrasPreMinuta = minutaIdsIniciais.length > 0
          ? await dbReadonly`
              SELECT DISTINCT pm.malote AS barra
              FROM pre_minuta pm
              WHERE pm.id_minuta = ANY(${minutaIdsIniciais})
            `
          : [];

        const allBarcodesSet = new Set<string>(barcodesIniciais);
        for (const b of barrasVolumes) {
          if (b.barra && String(b.barra).length === 17) {
            allBarcodesSet.add(String(b.barra));
          }
        }
        for (const b of barrasPreMinuta) {
          if (b.barra) allBarcodesSet.add(String(b.barra));
        }

        const allBarcodes = Array.from(allBarcodesSet);

        // 3. Buscar detalhes das minutas para todas as barras
        //    PRIMÁRIO: volumes (tem parcial diretamente, sem subquery)
        //    FALLBACK: pre_minuta → historico_volume
        const detalhesVolumes = await dbReadonly`
          SELECT DISTINCT ON (v.barras)
            v.barras          AS barra,
            NULL::bigint      AS id_manifesto,
            v.id_minuta,
            v.parcial,
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
          FROM volumes v
          INNER JOIN minuta m ON v.id_minuta = m.id_minuta
          LEFT JOIN rotas r ON m.rota::text = r.id::text
          LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
          LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
          WHERE v.barras = ANY(${allBarcodes})
            AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
          ORDER BY v.barras
        `;

        const detalheMap = new Map<string, {
          id_minuta: number | null;
          id_manifesto: number | null;
          prev_entrega: string | null;
          origem_nome: string | null;
          destino_nome: string | null;
          rota_nome: string | null;
          praca: string | null;
          minuta_status: number | null;
          total_volumes: number | null;
          parcial: number | null;
          cte_zero: boolean;
        }>();

        for (const d of detalhesVolumes) {
          detalheMap.set(String(d.barra), {
            id_minuta:     d.id_minuta     ? Number(d.id_minuta)     : null,
            id_manifesto:  null,
            prev_entrega:  d.prev_entrega  as string | null,
            origem_nome:   d.origem_nome   as string | null,
            destino_nome:  d.destino_nome  as string | null,
            rota_nome:     d.rota_nome     as string | null,
            praca:         d.praca         as string | null,
            minuta_status: d.minuta_status ? Number(d.minuta_status) : null,
            total_volumes: d.total_volumes ? Number(d.total_volumes) : null,
            parcial:       d.parcial != null ? Number(d.parcial)     : null,
            cte_zero:      String(d.cte_numero ?? '') === '0',
          });
        }

        const barcodesSemDetalhes = allBarcodes.filter((b) => !detalheMap.has(b));
        if (barcodesSemDetalhes.length > 0) {
          const detalhesPreMinuta = await dbReadonly`
            SELECT DISTINCT ON (pm.malote)
              pm.malote         AS barra,
              NULL::bigint      AS id_manifesto,
              pm.id_minuta,
              NULL::integer     AS parcial,
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
            FROM pre_minuta pm
            INNER JOIN minuta m ON pm.id_minuta = m.id_minuta
            LEFT JOIN rotas r ON m.rota::text = r.id::text
            LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
            LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
            WHERE pm.malote = ANY(${barcodesSemDetalhes})
            ORDER BY pm.malote, pm.data_hora DESC
          `;

          for (const d of detalhesPreMinuta) {
            detalheMap.set(String(d.barra), {
              id_minuta:     d.id_minuta     ? Number(d.id_minuta)     : null,
              id_manifesto:  null,
              prev_entrega:  d.prev_entrega  as string | null,
              origem_nome:   d.origem_nome   as string | null,
              destino_nome:  d.destino_nome  as string | null,
              rota_nome:     d.rota_nome     as string | null,
              praca:         d.praca         as string | null,
              minuta_status: d.minuta_status ? Number(d.minuta_status) : null,
              total_volumes: d.total_volumes ? Number(d.total_volumes) : null,
              parcial:       null,
              cte_zero:      String(d.cte_numero ?? '') === '0',
            });
          }
        }

        const barcodesSemDetalhes2 = allBarcodes.filter((b) => !detalheMap.has(b));
        if (barcodesSemDetalhes2.length > 0) {
          const detalhesHistorico = await dbReadonly`
            SELECT DISTINCT ON (h.barra)
              h.barra,
              h.manifesto       AS id_manifesto,
              v.id_minuta,
              v.parcial,
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
            WHERE h.barra = ANY(${barcodesSemDetalhes2})
            ORDER BY h.barra, h.data DESC, h.id DESC
          `;

          for (const d of detalhesHistorico) {
            detalheMap.set(String(d.barra), {
              id_minuta:     d.id_minuta     ? Number(d.id_minuta)     : null,
              id_manifesto:  d.id_manifesto  ? Number(d.id_manifesto)  : null,
              prev_entrega:  d.prev_entrega  as string | null,
              origem_nome:   d.origem_nome   as string | null,
              destino_nome:  d.destino_nome  as string | null,
              rota_nome:     d.rota_nome     as string | null,
              praca:         d.praca         as string | null,
              minuta_status: d.minuta_status ? Number(d.minuta_status) : null,
              total_volumes: d.total_volumes ? Number(d.total_volumes) : null,
              parcial:       d.parcial != null ? Number(d.parcial)     : null,
              cte_zero:      String(d.cte_numero ?? '') === '0',
            });
          }
        }

        // parcial já vem do volumes na consulta primária; para os itens via pre_minuta/historico,
        // tentamos buscar o parcial via volumes.barras diretamente
        const parciaisFaltantes = allBarcodes.filter((b) => detalheMap.get(b)?.parcial == null);
        if (parciaisFaltantes.length > 0) {
          const parciaisAchados = await dbReadonly`
            SELECT DISTINCT ON (v.barras)
              v.barras AS barra,
              v.parcial
            FROM volumes v
            WHERE v.barras = ANY(${parciaisFaltantes})
              AND v.barras IS NOT NULL AND v.parcial IS NOT NULL
          `;
          for (const p of parciaisAchados) {
            const item = detalheMap.get(String(p.barra));
            if (item && p.parcial != null) {
              item.parcial = Number(p.parcial);
            }
          }
        }

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

        const minutaIds = Array.from(
          new Set(
            Array.from(detalheMap.values())
              .map((d) => d.id_minuta)
              .filter((id): id is number => id !== null)
          )
        );

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
         const concluidosPracas = new Set(invs.filter(i => i.status === "CONCLUIDO").map(i => i.praca_label ?? 'SEM_PRACA'));
         
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

      const barcodeParaMinuta = new Map<string, number>();
      const minutasUnicasEncontradas = new Set<number>();

      if (todosBarcodes.length > 0) {
        // 1. Busca PRIMÁRIA em volumes.barras (cobre todos os volumes)
        const detalhesVolumes = await dbReadonly`
          SELECT DISTINCT ON (v.barras)
            v.barras AS barra,
            v.id_minuta
          FROM volumes v
          WHERE v.barras = ANY(${todosBarcodes})
            AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
        `;

        for (const row of detalhesVolumes) {
          if (row.id_minuta) {
            barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
            minutasUnicasEncontradas.add(Number(row.id_minuta));
          }
        }

        // 2. Fallback em pre_minuta
        const faltantesPM = todosBarcodes.filter((b) => !barcodeParaMinuta.has(b));
        if (faltantesPM.length > 0) {
          const detalhesPreMinuta = await dbReadonly`
            SELECT DISTINCT ON (pm.malote)
              pm.malote AS barra,
              pm.id_minuta
            FROM pre_minuta pm
            WHERE pm.malote = ANY(${faltantesPM})
            ORDER BY pm.malote, pm.data_hora DESC
          `;

          for (const row of detalhesPreMinuta) {
            if (row.id_minuta) {
              barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
              minutasUnicasEncontradas.add(Number(row.id_minuta));
            }
          }
        }

        // 3. Fallback em historico_volume
        const faltantesDashboard = todosBarcodes.filter((b) => !barcodeParaMinuta.has(b));
        if (faltantesDashboard.length > 0) {
          const detalhesBarcodes = await dbReadonly`
            SELECT DISTINCT ON (h.barra)
              h.barra,
              v.id_minuta
            FROM historico_volume h
            INNER JOIN volumes v ON h.id_volume = v.id_volume
            WHERE h.barra = ANY(${faltantesDashboard})
            ORDER BY h.barra, h.id DESC
          `;

          for (const row of detalhesBarcodes) {
            if (row.id_minuta) {
              barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
              minutasUnicasEncontradas.add(Number(row.id_minuta));
            }
          }
        }
      }

      // Descobrir o total absoluto de volumes de cada minuta
      const totaisPorMinuta = new Map<number, number>();
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
              bipadosPorMinuta.set(mId, (bipadosPorMinuta.get(mId) ?? 0) + 1);
            }
          }
        }

        // Calcular divergência matemática: se bipou menos que o total da minuta -> divergência
        let divergenciasDoInv = 0;
        for (const [mId, qtdBipada] of bipadosPorMinuta.entries()) {
          const totalDaMinuta = totaisPorMinuta.get(mId) ?? 0;
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

      const barcodeMesMinutaMap = new Map<string, number>();
      const minutasUnicasMes = new Set<number>();

      if (todosMesBarcodes.length > 0) {
        // 1. Busca PRIMÁRIA em volumes.barras
        const detalhesMesVol = await dbReadonly`
          SELECT DISTINCT ON (v.barras)
            v.barras AS barra,
            v.id_minuta
          FROM volumes v
          WHERE v.barras = ANY(${todosMesBarcodes})
            AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
        `;

        for (const row of detalhesMesVol) {
          if (row.id_minuta) {
            barcodeMesMinutaMap.set(String(row.barra), Number(row.id_minuta));
            minutasUnicasMes.add(Number(row.id_minuta));
          }
        }

        // 2. Fallback em pre_minuta
        const faltantesMesPM = todosMesBarcodes.filter((b) => !barcodeMesMinutaMap.has(b));
        if (faltantesMesPM.length > 0) {
          const detalhesMesPM = await dbReadonly`
            SELECT DISTINCT ON (pm.malote)
              pm.malote AS barra,
              pm.id_minuta
            FROM pre_minuta pm
            WHERE pm.malote = ANY(${faltantesMesPM})
            ORDER BY pm.malote, pm.data_hora DESC
          `;

          for (const row of detalhesMesPM) {
            if (row.id_minuta) {
              barcodeMesMinutaMap.set(String(row.barra), Number(row.id_minuta));
              minutasUnicasMes.add(Number(row.id_minuta));
            }
          }
        }

        // 3. Fallback em historico_volume
        const faltantesMes = todosMesBarcodes.filter((b) => !barcodeMesMinutaMap.has(b));
        if (faltantesMes.length > 0) {
          const detalhes = await dbReadonly`
            SELECT DISTINCT ON (h.barra) h.barra, v.id_minuta
            FROM historico_volume h
            INNER JOIN volumes v ON h.id_volume = v.id_volume
            WHERE h.barra = ANY(${faltantesMes})
            ORDER BY h.barra, h.id DESC
          `;

          for (const row of detalhes) {
            if (row.id_minuta) {
              barcodeMesMinutaMap.set(String(row.barra), Number(row.id_minuta));
              minutasUnicasMes.add(Number(row.id_minuta));
            }
          }
        }
      }

      const totaisMesPorMinuta = new Map<number, number>();
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
              bipadosPorMinutaMes.set(mId, (bipadosPorMinutaMes.get(mId) ?? 0) + 1);
            }
          }
        }

        // Se bipou menos que o total -> divergência
        for (const [mId, qtdBipada] of bipadosPorMinutaMes.entries()) {
          const totalDaMinuta = totaisMesPorMinuta.get(mId) ?? 0;
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
          itens: { select: { status_auditoria: true, codigo_barra: true } },
          _count: { select: { itens: true } }
        }
      });

      // Coleta todos os barcodes para identificar minutas e totais de volumes no banco legado
      const todosBarcodes = inventariosDb.flatMap(inv => inv.itens.map(i => i.codigo_barra));
      const barcodeParaMinuta = new Map<string, number>();
      const minutasUnicasEncontradas = new Set<number>();

      if (todosBarcodes.length > 0) {
        // 1. Busca PRIMÁRIA em volumes.barras
        const detalhesVol = await dbReadonly`
          SELECT DISTINCT ON (v.barras)
            v.barras AS barra,
            v.id_minuta
          FROM volumes v
          WHERE v.barras = ANY(${todosBarcodes})
            AND v.barras IS NOT NULL AND LENGTH(v.barras) = 17
        `;

        for (const row of detalhesVol) {
          if (row.id_minuta) {
            barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
            minutasUnicasEncontradas.add(Number(row.id_minuta));
          }
        }

        // 2. Fallback em pre_minuta
        const faltantesPM = todosBarcodes.filter((b) => !barcodeParaMinuta.has(b));
        if (faltantesPM.length > 0) {
          const detalhesPM = await dbReadonly`
            SELECT DISTINCT ON (pm.malote)
              pm.malote AS barra,
              pm.id_minuta
            FROM pre_minuta pm
            WHERE pm.malote = ANY(${faltantesPM})
            ORDER BY pm.malote, pm.data_hora DESC
          `;

          for (const row of detalhesPM) {
            if (row.id_minuta) {
              barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
              minutasUnicasEncontradas.add(Number(row.id_minuta));
            }
          }
        }

        // 3. Fallback em historico_volume
        const faltantesHist = todosBarcodes.filter((b) => !barcodeParaMinuta.has(b));
        if (faltantesHist.length > 0) {
          const detalhesBarcodes = await dbReadonly`
            SELECT DISTINCT ON (h.barra)
              h.barra,
              v.id_minuta
            FROM historico_volume h
            INNER JOIN volumes v ON h.id_volume = v.id_volume
            WHERE h.barra = ANY(${faltantesHist})
            ORDER BY h.barra, h.data DESC, h.id DESC
          `;

          for (const row of detalhesBarcodes) {
            if (row.id_minuta) {
              barcodeParaMinuta.set(String(row.barra), Number(row.id_minuta));
              minutasUnicasEncontradas.add(Number(row.id_minuta));
            }
          }
        }
      }

      // Descobrir total de volumes de cada minuta no legado
      const totaisPorMinuta = new Map<number, number>();
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

      const items = inventariosDb.map(inv => {
        let bipados = 0;
        const bipadosPorMinuta = new Map<number, number>();

        for (const item of inv.itens) {
          if (item.status_auditoria !== "FALTANTE") {
            bipados++;
            const mId = barcodeParaMinuta.get(String(item.codigo_barra));
            if (mId) {
              bipadosPorMinuta.set(mId, (bipadosPorMinuta.get(mId) ?? 0) + 1);
            }
          }
        }

        // Divergência: quantidade de minutas com volumes faltantes do total
        // Faltantes: soma da quantidade de volumes faltantes dessas minutas
        let divergencias = 0;
        let faltantes = 0;

        for (const [mId, qtdBipada] of bipadosPorMinuta.entries()) {
          const totalMinuta = totaisPorMinuta.get(mId) ?? 0;
          if (qtdBipada > 0 && qtdBipada < totalMinuta) {
            divergencias++;
            faltantes += (totalMinuta - qtdBipada);
          }
        }

        return {
          id: inv.id,
          unidade_id: inv.unidade_id,
          status: inv.status,
          criadoEm: inv.criadoEm,
          atualizadoEm: inv.atualizadoEm,
          bipados,
          divergencias,
          faltantes,
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
