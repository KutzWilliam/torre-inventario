import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { dbReadonly } from "@/server/db-readonly";
import { TRPCError } from "@trpc/server";

export const investigacaoRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // buscarMinuta
  // Localiza minutas por número de minuta, número de CTE ou código de barras de volume
  // ---------------------------------------------------------------------------
  buscarMinuta: publicProcedure
    .input(z.object({ termo: z.string().trim() }))
    .query(async ({ input }) => {
      const termo = input.termo;
      if (!termo || termo.length < 2) return [];

      let minutaIds: number[] = [];

      // 1. Se tem 17 caracteres ou parece código de barras, busca na tabela volumes / pre_minuta / historico
      if (termo.length === 17 || /^\d{15,20}$/.test(termo)) {
        const porVolumes = await dbReadonly`
          SELECT DISTINCT v.id_minuta
          FROM volumes v
          WHERE v.barras = ${termo}
          LIMIT 10
        `;
        minutaIds.push(...porVolumes.map((r) => Number(r.id_minuta)).filter(Boolean));

        if (minutaIds.length === 0) {
          const porPreMinuta = await dbReadonly`
            SELECT DISTINCT pm.id_minuta
            FROM pre_minuta pm
            WHERE pm.malote = ${termo}
            LIMIT 10
          `;
          minutaIds.push(...porPreMinuta.map((r) => Number(r.id_minuta)).filter(Boolean));
        }

        if (minutaIds.length === 0) {
          const porHistorico = await dbReadonly`
            SELECT DISTINCT v.id_minuta
            FROM historico_volume h
            INNER JOIN volumes v ON h.id_volume = v.id_volume
            WHERE h.barra = ${termo}
            LIMIT 10
          `;
          minutaIds.push(...porHistorico.map((r) => Number(r.id_minuta)).filter(Boolean));
        }
      }

      // 2. Se for número ou ainda não achou nada, busca por id_minuta ou cte_numero
      const termoNum = Number(termo);
      const isNum = !isNaN(termoNum) && termoNum > 0;

      const porMinutaOuCte = await dbReadonly`
        SELECT m.id_minuta
        FROM minuta m
        WHERE ${isNum ? dbReadonly`m.id_minuta = ${termoNum} OR m.cte_numero = ${termoNum}` : dbReadonly`FALSE`}
           OR m.cte_numero::text = ${termo}
        ORDER BY m.id_minuta DESC
        LIMIT 10
      `;
      minutaIds.push(...porMinutaOuCte.map((r) => Number(r.id_minuta)).filter(Boolean));

      minutaIds = Array.from(new Set(minutaIds));

      if (minutaIds.length === 0) {
        return [];
      }

      // 3. Carregar dados das minutas encontradas
      const minutas = await dbReadonly`
        SELECT 
          m.id_minuta,
          m.cte_numero,
          m.status,
          m.total_volumes,
          m.prev_entrega,
          COALESCE(
            ro.rota,
            (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
            m.origem
          ) AS origem_nome,
          COALESCE(
            rd.rota,
            (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
            m.destino
          ) AS destino_nome,
          r.rota AS rota_nome
        FROM minuta m
        LEFT JOIN rotas r ON m.rota::text = r.id::text
        LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
        LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
        WHERE m.id_minuta = ANY(${minutaIds})
        ORDER BY m.id_minuta DESC
      `;

      return minutas.map((m) => ({
        id_minuta: Number(m.id_minuta),
        cte_numero: m.cte_numero ? String(m.cte_numero) : null,
        status: m.status ? Number(m.status) : null,
        total_volumes: m.total_volumes ? Number(m.total_volumes) : null,
        prev_entrega: m.prev_entrega as string | null,
        origem_nome: (m.origem_nome as string | null) ?? "N/D",
        destino_nome: (m.destino_nome as string | null) ?? "N/D",
        rota_nome: (m.rota_nome as string | null) ?? null,
      }));
    }),

  // ---------------------------------------------------------------------------
  // obterDetalhesInvestigacao
  // Traz a radiografia completa de uma minuta para investigação de extravio
  // ---------------------------------------------------------------------------
  obterDetalhesInvestigacao: publicProcedure
    .input(z.object({ idMinuta: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const idMinuta = input.idMinuta;

      // 1. Dados cadastrais da minuta
      const [minutaRow] = await dbReadonly`
        SELECT 
          m.id_minuta,
          m.cte_numero,
          m.status,
          m.total_volumes,
          m.prev_entrega,
          COALESCE(
            ro.rota,
            (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1),
            m.origem
          ) AS origem_nome,
          COALESCE(
            rd.rota,
            (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1),
            m.destino
          ) AS destino_nome,
          r.rota AS rota_nome
        FROM minuta m
        LEFT JOIN rotas r ON m.rota::text = r.id::text
        LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
        LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
        WHERE m.id_minuta = ${idMinuta}
        LIMIT 1
      `;

      if (!minutaRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Minuta ${idMinuta} não encontrada.`,
        });
      }

      // 2. Ocorrências da minuta (frete_hist + tipo_oco)
      const ocorrencias = await dbReadonly`
        SELECT 
          f.id_log,
          f.frete AS id_minuta,
          f.status AS id_oco,
          t.descricao AS descricao,
          f.created_at AS data_evento
        FROM frete_hist f
        LEFT JOIN tipo_oco t ON t.id_oco = f.status
        WHERE f.frete = ${idMinuta}
        ORDER BY f.created_at DESC, f.id_log DESC
      `;

      // 3. Volumes cadastrados na minuta
      const volumesCadastrados = await dbReadonly`
        SELECT 
          v.id_volume,
          v.barras,
          v.parcial
        FROM volumes v
        WHERE v.id_minuta = ${idMinuta}
        ORDER BY v.parcial ASC NULLS LAST, v.id_volume ASC
      `;

      // Se por algum motivo houver códigos de barra em pre_minuta ou historico que não constam em volumes
      const barrasConhecidas = new Set(
        volumesCadastrados.map((v) => String(v.barras ?? "")).filter((b) => b.length === 17)
      );

      const volumesPreMinuta = await dbReadonly`
        SELECT DISTINCT pm.malote AS barras
        FROM pre_minuta pm
        WHERE pm.id_minuta = ${idMinuta}
          AND pm.malote IS NOT NULL
      `;
      for (const pm of volumesPreMinuta) {
        const b = String(pm.barras ?? "");
        if (b.length === 17 && !barrasConhecidas.has(b)) {
          barrasConhecidas.add(b);
        }
      }

      const listaBarras = Array.from(barrasConhecidas);

      // 4. Movimentações Brudam (historico_volume + picking + unidades + manifesto)
      let movimentacoesBrudam: {
        id: number;
        barra: string;
        data: Date;
        tipo: number; // 1 = Embarque, 2 = Desembarque
        manifesto: number | null;
        picking_unidade: number | null;
        unidade_nome: string | null;
        unidade_sigla: string | null;
        manifesto_base: number | null;
        manifesto_status: number | null;
        placa: string | null;
      }[] = [];

      if (listaBarras.length > 0) {
        const histRows = await dbReadonly`
          SELECT 
            h.id,
            h.barra,
            h.data,
            h.tipo AS h_tipo,
            h.manifesto,
            p.unidade AS picking_unidade,
            u.fantasia AS unidade_nome,
            u.sigla AS unidade_sigla,
            man.base AS manifesto_base,
            man.status AS manifesto_status,
            vec.placa AS veiculo_placa
          FROM historico_volume h
          LEFT JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
          LEFT JOIN unidades u ON p.unidade = u.id_unidade
          LEFT JOIN manifesto man ON h.manifesto = man.id_manifesto
          LEFT JOIN veiculos vec ON (man.veiculo = vec.id_veiculo OR man.veiculo_terceiro = vec.id_veiculo)
          WHERE h.barra = ANY(${listaBarras})
          ORDER BY h.data ASC, h.id ASC
        `;

        movimentacoesBrudam = histRows.map((r) => ({
          id: Number(r.id),
          barra: String(r.barra),
          data: new Date(r.data as string | number | Date),
          tipo: Number(r.h_tipo),
          manifesto: r.manifesto ? Number(r.manifesto) : null,
          picking_unidade: r.picking_unidade ? Number(r.picking_unidade) : null,
          unidade_nome: (r.unidade_nome as string | null) ?? null,
          unidade_sigla: (r.unidade_sigla as string | null) ?? null,
          manifesto_base: r.manifesto_base ? Number(r.manifesto_base) : null,
          manifesto_status: r.manifesto_status ? Number(r.manifesto_status) : null,
          placa: (r.veiculo_placa as string | null) ?? null,
        }));
      }

      // 5. Leituras em inventários da aplicação (Prisma)
      const leiturasInventario = listaBarras.length > 0
        ? await ctx.db.itemInventario.findMany({
            where: {
              codigo_barra: { in: listaBarras },
            },
            include: {
              inventario: true,
            },
            orderBy: { criadoEm: "desc" },
          })
        : [];

      // Obter nomes das unidades dos inventários
      const unidadeIdsInventario = Array.from(
        new Set(leiturasInventario.map((li) => li.inventario.unidade_id))
      );

      const nomesUnidadesInv = unidadeIdsInventario.length > 0
        ? await dbReadonly`
            SELECT id_unidade, fantasia, sigla
            FROM unidades
            WHERE id_unidade = ANY(${unidadeIdsInventario})
          `
        : [];

      const mapaUnidadesInv = new Map(
        nomesUnidadesInv.map((u) => [
          Number(u.id_unidade),
          { fantasia: u.fantasia as string, sigla: u.sigla as string },
        ])
      );

      const inventariosFormatados = leiturasInventario.map((li) => {
        const u = mapaUnidadesInv.get(li.inventario.unidade_id);
        return {
          id: li.id,
          codigo_barra: li.codigo_barra,
          inventario_id: li.inventario_id,
          unidade_id: li.inventario.unidade_id,
          unidade_nome: u?.fantasia ?? `Unidade #${li.inventario.unidade_id}`,
          unidade_sigla: u?.sigla ?? null,
          praca: li.inventario.praca_label ?? li.inventario.praca ?? null,
          status_auditoria: li.status_auditoria,
          inventario_status: li.inventario.status,
          data_leitura: li.criadoEm,
        };
      });

      // 6. Construir visão detalhada por volume
      const volumesMap = new Map<string, {
        barra: string;
        parcial: number | null;
        id_volume: number | null;
      }>();

      for (const v of volumesCadastrados) {
        const b = String(v.barras ?? "");
        if (b) {
          volumesMap.set(b, {
            barra: b,
            parcial: v.parcial != null ? Number(v.parcial) : null,
            id_volume: v.id_volume != null ? Number(v.id_volume) : null,
          });
        }
      }

      for (const b of listaBarras) {
        if (!volumesMap.has(b)) {
          volumesMap.set(b, {
            barra: b,
            parcial: null,
            id_volume: null,
          });
        }
      }

      // Agrupar movimentações por barra
      const movsPorBarra = new Map<string, typeof movimentacoesBrudam>();
      for (const mov of movimentacoesBrudam) {
        const arr = movsPorBarra.get(mov.barra) ?? [];
        arr.push(mov);
        movsPorBarra.set(mov.barra, arr);
      }

      // Agrupar inventários por barra
      const invsPorBarra = new Map<string, typeof inventariosFormatados>();
      for (const inv of inventariosFormatados) {
        const arr = invsPorBarra.get(inv.codigo_barra) ?? [];
        arr.push(inv);
        invsPorBarra.set(inv.codigo_barra, arr);
      }

      // Montar cada volume com diagnóstico individual
      const volumesProcessados = Array.from(volumesMap.values()).map((vol) => {
        const movs = movsPorBarra.get(vol.barra) ?? [];
        const invs = invsPorBarra.get(vol.barra) ?? [];

        const ultimaMovBrudam = movs.length > 0 ? movs[movs.length - 1]! : null;
        const ultimoInventario = invs.length > 0 ? invs[0]! : null;

        // Determinar status operacional e localização atual
        let localizacaoAtual = "SEM REGISTRO";
        let statusOperacional: "DESEMBARCADO" | "EMBARCADO" | "INVENTARIADO" | "SEM_BIPAGEM" = "SEM_BIPAGEM";
        let ultimaData: Date | null = null;

        if (ultimaMovBrudam) {
          ultimaData = ultimaMovBrudam.data;
          const tipoStr = ultimaMovBrudam.tipo === 2 ? "Desembarque" : "Embarque";
          localizacaoAtual = `${ultimaMovBrudam.unidade_nome ?? "Unidade desconhecida"} (${tipoStr})`;
          statusOperacional = ultimaMovBrudam.tipo === 2 ? "DESEMBARCADO" : "EMBARCADO";
        }

        // Se o inventário foi mais recente que a Brudam, damos peso ao inventário
        if (ultimoInventario && (!ultimaData || ultimoInventario.data_leitura > ultimaData)) {
          if (ultimoInventario.status_auditoria !== "FALTANTE") {
            localizacaoAtual = `${ultimoInventario.unidade_nome} (Inventário Torre)`;
            statusOperacional = "INVENTARIADO";
            ultimaData = ultimoInventario.data_leitura;
          }
        }

        return {
          ...vol,
          ultimaMovBrudam,
          ultimoInventario,
          localizacaoAtual,
          statusOperacional,
          ultimaData,
          totalMovimentacoes: movs.length,
          totalInventarios: invs.length,
          historicoBrudam: movs,
          historicoInventario: invs,
        };
      });

      // Ordenar volumes pelo número do parcial (1, 2, 3...)
      volumesProcessados.sort((a, b) => {
        if (a.parcial != null && b.parcial != null) return a.parcial - b.parcial;
        if (a.parcial != null) return -1;
        if (b.parcial != null) return 1;
        return a.barra.localeCompare(b.barra);
      });

      // 7. Diagnóstico e Alertas Inteligentes da Minuta
      const agrupamentoPorLocal = new Map<string, {
        local: string;
        unidade_nome: string;
        tipo: string;
        qtd: number;
        volumes: { barra: string; parcial: number | null }[];
      }>();

      for (const v of volumesProcessados) {
        const localKey = v.localizacaoAtual;
        const entry = agrupamentoPorLocal.get(localKey) ?? {
          local: localKey,
          unidade_nome: v.ultimaMovBrudam?.unidade_nome ?? v.ultimoInventario?.unidade_nome ?? "Desconhecido",
          tipo: v.statusOperacional,
          qtd: 0,
          volumes: [],
        };
        entry.qtd += 1;
        entry.volumes.push({ barra: v.barra, parcial: v.parcial });
        agrupamentoPorLocal.set(localKey, entry);
      }

      const gruposLocais = Array.from(agrupamentoPorLocal.values());
      const temDivergenciaVolumes = gruposLocais.length > 1;

      // Alertas operacionais
      const alertas: { tipo: "info" | "warning" | "danger" | "success"; titulo: string; mensagem: string }[] = [];

      const totalEsperado = Number(minutaRow.total_volumes ?? 0);
      const totalEncontrado = volumesProcessados.length;

      if (totalEsperado > 0 && totalEncontrado < totalEsperado) {
        alertas.push({
          tipo: "danger",
          titulo: "Volumes Faltantes no Cadastro",
          mensagem: `A minuta declara ${totalEsperado} volumes, mas apenas ${totalEncontrado} possuem código cadastrado no banco.`,
        });
      }

      if (temDivergenciaVolumes) {
        const detalheGrupos = gruposLocais
          .map((g) => `${g.qtd} volume(s) em ${g.local}`)
          .join(", ");
        alertas.push({
          tipo: "danger",
          titulo: "Carga Fragmentada / Volumes Separados",
          mensagem: `Os volumes da minuta foram registrados em locais diferentes: ${detalheGrupos}. Isso indica que volumes ficaram para trás durante a rota.`,
        });
      } else if (gruposLocais.length === 1 && gruposLocais[0]?.tipo === "DESEMBARCADO") {
        alertas.push({
          tipo: "info",
          titulo: "Todos os volumes no mesmo local",
          mensagem: `Todos os ${totalEncontrado} volumes constam juntos na última localização: ${gruposLocais[0].local}.`,
        });
      }

      // Verificar volumes que nunca foram bipados
      const volumesSemBipagem = volumesProcessados.filter((v) => v.statusOperacional === "SEM_BIPAGEM");
      if (volumesSemBipagem.length > 0) {
        alertas.push({
          tipo: "warning",
          titulo: "Volumes sem nenhuma bipagem",
          mensagem: `${volumesSemBipagem.length} volume(s) da minuta nunca foram bipados em nenhuma etapa operacional da Brudam nem em inventários.`,
        });
      }

      // Verificar ocorrências de avaria/extravio
      const ocorrenciasExtravio = ocorrencias.filter((o) => {
        const desc = (o.descricao as string | null ?? "").toUpperCase();
        return desc.includes("EXTRAVIO") || desc.includes("AVARIA") || desc.includes("ROUBO") || desc.includes("FALTA");
      });

      if (ocorrenciasExtravio.length > 0) {
        alertas.push({
          tipo: "warning",
          titulo: "Ocorrência Crítica Registrada",
          mensagem: `Consta(m) ${ocorrenciasExtravio.length} ocorrência(s) de sinistro/divergência para esta minuta: ${ocorrenciasExtravio.map((o) => String(o.descricao ?? "")).join("; ")}.`,
        });
      }

      // Verificar inventários onde foi bipado como sobra ou faltante
      const leiturasSobra = inventariosFormatados.filter((i) => i.status_auditoria === "SOBRA_NA_BASE");
      if (leiturasSobra.length > 0) {
        alertas.push({
          tipo: "warning",
          titulo: "Identificado como Sobra em Inventário",
          mensagem: `Volume(s) desta minuta foram encontrados como SOBRA NA BASE na(s) unidade(s): ${Array.from(new Set(leiturasSobra.map(s => s.unidade_nome))).join(", ")}.`,
        });
      }

      return {
        minuta: {
          id_minuta: Number(minutaRow.id_minuta),
          cte_numero: minutaRow.cte_numero ? String(minutaRow.cte_numero) : null,
          status: minutaRow.status ? Number(minutaRow.status) : null,
          total_volumes: totalEsperado,
          prev_entrega: minutaRow.prev_entrega as string | null,
          origem_nome: (minutaRow.origem_nome as string | null) ?? "N/D",
          destino_nome: (minutaRow.destino_nome as string | null) ?? "N/D",
          rota_nome: (minutaRow.rota_nome as string | null) ?? null,
        },
        alertas,
        gruposLocais,
        volumes: volumesProcessados,
        ocorrencias: ocorrencias.map((o) => ({
          id: Number(o.id_log),
          id_oco: o.id_oco ? Number(o.id_oco) : null,
          descricao: (o.descricao as string | null) ?? "Ocorrência sem descrição",
          data_evento: o.data_evento ? new Date(o.data_evento as string | number | Date) : null,
        })),
        inventarios: inventariosFormatados,
      };
    }),
});
