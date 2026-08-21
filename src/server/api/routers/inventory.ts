import { z } from "zod";
import { Prisma } from "@prisma/client";
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
      return ctx.db.itemInventario.findMany({
        where: { inventario_id: input.inventarioId },
        orderBy: { criadoEm: "desc" },
        take: 200,
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
    .input(z.object({ unidade_id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const novoInventario = await ctx.db.inventario.create({
        data: {
          unidade_id: input.unidade_id,
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
      const teoricos = await dbReadonly`
        -- Obtém a última movimentação de cada barra nos últimos 90 dias
        -- e verifica se esse último movimento foi DESEMBARQUE nessa unidade.
        -- Volumes que já foram embarcados após o desembarque NÃO aparecem aqui.
        SELECT barra
        FROM (
          SELECT DISTINCT ON (h.barra)
            h.barra,
            p.unidade AS picking_unidade,
            p.tipo    AS picking_tipo
          FROM historico_volume h
          INNER JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          INNER JOIN volumes  v ON h.id_volume  = v.id_volume
          INNER JOIN minuta   m ON v.id_minuta  = m.id_minuta
          WHERE h.data >= NOW() - INTERVAL '90 days'
            AND m.status NOT IN (6, 13)
            AND m.cte_numero != 0
          ORDER BY h.barra, h.id DESC  -- Pega o último registro de cada barra
        ) ultima_mov
        WHERE picking_tipo = 2                       -- Última ação = desembarque
          AND picking_unidade = ${unidadeId}         -- Nessa unidade especificamente
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
          divergencias.push(item);
        } else {
          if (item.status_auditoria === "SOBRA_NA_BASE") sobras++;
          if (item.status_auditoria === "FALTANTE")      faltantes++;
          divergencias.push(item);
        }
      }

      // Enriquece as divergências com dados do banco legado
      // (minuta, manifesto, prev_entrega, origem, destino, ultima_bipagem, ultima_ocorrencia)
      let divergenciasEnriquecidas: (typeof itens[number] & {
        detalhe: {
          id_minuta:    number | null;
          id_manifesto: number | null;
          prev_entrega: string | null;
          origem_nome:  string | null;
          destino_nome: string | null;
          minuta_status: number | null;
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

      if (divergencias.length > 0) {
        const barcodes = divergencias.map((d) => d.codigo_barra);

        const detalhes = await dbReadonly`
          SELECT DISTINCT ON (h.barra)
            h.barra,
            h.manifesto       AS id_manifesto,
            v.id_minuta,
            m.prev_entrega,
            COALESCE(
              (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
              m.origem
            )                 AS origem_nome,
            COALESCE(
              (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
              m.destino
            )                 AS destino_nome,
            m.status          AS minuta_status,
            m.cte_numero      AS cte_numero
          FROM historico_volume h
          INNER JOIN volumes v ON h.id_volume  = v.id_volume
          INNER JOIN minuta  m ON v.id_minuta  = m.id_minuta
          WHERE h.barra = ANY(${barcodes})
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
              minuta_status: d.minuta_status ? Number(d.minuta_status) : null,
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
          WHERE h.barra = ANY(${barcodes})
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

        // Busca a última ocorrência de cada volume via id_minuta
        // (processo já tem id_minuta diretamente -- sem join intermediário)
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

        // Mapa id_minuta -> ocorrencia
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

        divergenciasEnriquecidas = divergencias.map((item) => {
          const detalhe = detalheMap.get(item.codigo_barra) ?? null;
          const minutaId = detalhe?.id_minuta ?? null;
          return {
            ...item,
            detalhe,
            ultima_bipagem: bipagensMap.get(item.codigo_barra) ?? null,
            ultima_ocorrencia: minutaId ? (ocorrenciasMap.get(minutaId) ?? null) : null,
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
      // 1. Calcular a data (Hoje por padrão ou a data enviada no input YYYY-MM-DD)
      const hoje = new Date();
      let inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
      let fimDia = new Date(hoje.setHours(23, 59, 59, 999));

      if (input.data) {
        const [ano, mes, dia] = input.data.split('-').map(Number) as [number, number, number];
        inicioDia = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
        fimDia = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
      }

      // 2. Buscar Inventários exatamente naquele dia
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

      // 3. Unidades com volumes ativos (do painel atual)
      // Como o listarUnidadesComVolumes faz um agrupamento direto no banco legado, 
      // podemos apenas buscar o total de registros do DB Prisma para unidades_ativas
      // Para manter coerência e não atrasar, pegaremos o número de inventários únicos realizados no período:

      // 3. Métricas base
      const inventariosEmAndamento = inventariosDb.filter(inv => inv.status === "ABERTO").length;
      const inventariosConcluidos = inventariosDb.filter(inv => inv.status === "CONCLUIDO").length;
      const inventariosNoPeriodo = inventariosDb.length;
      
      let totalItensConferidos = 0;
      let divergenciasCriticas = 0;
      let itensExtraviados = 0;
      let divergenciasAbertas = 0;

      const inventariosDoDia = [];

      for (const inv of inventariosDb) {
        totalItensConferidos += inv._count.itens;
        let divergenciasDoInv = 0;
        let corretosDoInv = 0;
        let extraviosDoInv = 0;

        for (const item of inv.itens) {
          if (item.status_auditoria !== "ENCONTRADO_CORRETO") divergenciasDoInv++;
          else corretosDoInv++;

          if (item.status_auditoria === "POSSIVEL_EXTRAVIO") {
            itensExtraviados++;
            extraviosDoInv++;
          }
        }

        if (divergenciasDoInv > 0) divergenciasAbertas++;
        if (divergenciasDoInv > 50) divergenciasCriticas++; 

        inventariosDoDia.push({
          id: inv.id,
          unidade_id: inv.unidade_id,
          status: inv.status,
          bipados: inv._count.itens,
          corretos: corretosDoInv,
          divergentes: divergenciasDoInv,
          extravios: extraviosDoInv,
        });
      }

      // 5. Inventários Atrasados (Abertos há mais de 24h)
      const dataOntem = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const inventariosAtrasados = inventariosDb.filter(inv => inv.status === "ABERTO" && inv.criadoEm < dataOntem).length;

      // 6. Atividade Recente
      const atividadeRecente = inventariosDb.slice(0, 5).map(inv => ({
        id: inv.id,
        unidade_id: inv.unidade_id,
        status: inv.status,
        criadoEm: inv.criadoEm,
        itens: inv._count.itens,
      }));

      // 7. Resumo de Conferência (Taxa de Acuracidade por mês, histórico de 6 meses)
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 5);
      seisMesesAtras.setDate(1);
      seisMesesAtras.setHours(0,0,0,0);

      const invHistoricos = await ctx.db.inventario.findMany({
        where: { criadoEm: { gte: seisMesesAtras } },
        include: { itens: { select: { status_auditoria: true } } }
      });

      const mesesMap = new Map<string, { total: number, corretos: number }>();
      
      for (const inv of invHistoricos) {
        const m = inv.criadoEm.toLocaleString('pt-BR', { month: 'short' });
        const obj = mesesMap.get(m) ?? { total: 0, corretos: 0 };
        
        obj.total += inv.itens.length;
        obj.corretos += inv.itens.filter(i => i.status_auditoria === "ENCONTRADO_CORRETO").length;
        mesesMap.set(m, obj);
      }

      const resumoConferencia = Array.from(mesesMap.entries()).map(([mes, dados]) => ({
        mes,
        taxa: dados.total > 0 ? (dados.corretos / dados.total) * 100 : 0
      }));

      // 8. Unidades ativas agora (Para o KPI card: pegamos as únicas do banco legado)
      // Como não podemos juntar consultas tão facilmente e não queremos lentidão, passaremos "0" e faremos 
      // que o frontend utilize `listarUnidadesComVolumes` para somar a 'ativasAgora'.

      return {
        kpis: {
          inventariosNoPeriodo,
          inventariosEmAndamento,
          inventariosConcluidos,
          divergenciasAbertas,
          divergenciasCriticas,
          itensConferidos: totalItensConferidos,
        },
        pontosAtencao: {
          divergenciasCriticas,
          itensExtraviados,
          inventariosAtrasados
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
});
