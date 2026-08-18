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
  listarUnidadesComVolumes: publicProcedure.query(async () => {
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

    return rows.map((r) => ({
      id_unidade:    Number(r.id_unidade),
      fantasia:      r.fantasia as string,
      sigla:         r.sigla as string,
      total_volumes: Number(r.total_volumes),
      no_patio:      Number(r.no_patio),
      em_viagem:     Number(r.em_viagem),
    }));
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
});
