"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import * as XLSX from "xlsx";
import Image from "next/image";
import { useState, useMemo } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type Detalhe = {
  id_minuta: number | null;
  id_manifesto: number | null;
  prev_entrega: string | null;
  origem_nome: string | null;
  destino_nome: string | null;
  praca: string | null;
  minuta_status: number | null;
  total_volumes?: number | null;
  cte_zero?: boolean;
} | null;

type UltimaBipagem = {
  unidade_nome: string | null;
  unidade_sigla: string | null;
  tipo: "EMBARQUE" | "DESEMBARQUE" | null;
  data: Date | null;
} | null;

type ItemInventario = {
  id: string;
  codigo_barra: string;
  status_auditoria: string;
  criadoEm: Date;
  detalhe: Detalhe;
  ultima_bipagem?: UltimaBipagem;
  ultima_ocorrencia?: { id_oco: number | null; descricao: string | null; data_evento: Date | null } | null;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "FALTANTE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/50 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Faltante
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Lido
    </span>
  );
}

function UltimaBipagemBadge({ bipagem }: { bipagem: UltimaBipagem }) {
  if (!bipagem?.unidade_nome) return <span className="text-slate-300 text-sm">—</span>;
  const isEmbarque = bipagem.tipo === "EMBARQUE";
  const nomeDisplay = bipagem.unidade_nome.replace(/^(PRI|EPC|RI)\s+/i, "");
  return (
    <div className="flex flex-col gap-0.5">
      <span className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide w-fit",
        isEmbarque ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700",
      ].join(" ")}>
        {isEmbarque ? "Embarque" : "Desembarque"}
      </span>
      <span className="text-xs text-slate-600 font-medium leading-tight">
        {nomeDisplay}
        {bipagem.unidade_sigla ? (
          <span className="ml-1 text-slate-400 font-mono text-[10px]">({bipagem.unidade_sigla})</span>
        ) : null}
      </span>
    </div>
  );
}

function DivRow({ item }: { item: ItemInventario }) {
  const rota = item.detalhe?.destino_nome && item.detalhe?.origem_nome
    ? `${item.detalhe.origem_nome} -> ${item.detalhe.destino_nome}`
    : item.detalhe?.destino_nome ?? item.detalhe?.origem_nome ?? "—";

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
          {item.codigo_barra}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={item.status_auditoria} />
      </td>
      <td className="px-4 py-3">
        <UltimaBipagemBadge bipagem={item.ultima_bipagem ?? null} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.ultima_ocorrencia?.id_oco != null ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 w-fit">
              {item.ultima_ocorrencia.descricao ?? `Código ${item.ultima_ocorrencia.id_oco}`}
            </span>
            {item.ultima_ocorrencia.data_evento && (
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(item.ultima_ocorrencia.data_evento).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {item.detalhe?.id_manifesto ? (
          <span className="font-mono text-sm text-slate-700 font-medium">{item.detalhe.id_manifesto}</span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-slate-600">{formatDate(item.detalhe?.prev_entrega)}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600 leading-tight">{rota}</span>
        {item.detalhe?.praca && (
          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-500">
            {item.detalhe.praca}
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Componente Minuta Group ──────────────────────────────────────────────────

function MinutaGroup({ idMinuta, itens }: { idMinuta: string; itens: ItemInventario[] }) {
  const [expanded, setExpanded] = useState(false);

  const bipados = itens.filter(i => i.status_auditoria !== "FALTANTE").length;
  const faltantes = itens.filter(i => i.status_auditoria === "FALTANTE").length;
  const primeiroDetalhe = itens.find(i => i.detalhe)?.detalhe;

  // Calcular o total da minuta com base nos volumes retornados se não tiver o dado direto,
  // mas primeiroDetalhe?.total_volumes deve estar presente para minutas que vieram do banco legado.
  const totalMinuta = primeiroDetalhe?.total_volumes ?? (bipados + faltantes);

  const rota = primeiroDetalhe?.destino_nome && primeiroDetalhe?.origem_nome
    ? `${primeiroDetalhe.origem_nome} -> ${primeiroDetalhe.destino_nome}`
    : primeiroDetalhe?.destino_nome ?? primeiroDetalhe?.origem_nome ?? "—";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4 transition-all">
      <div
        className="px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${expanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
            <svg className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-lg">
                Minuta {idMinuta === "SEM_MINUTA" ? "Desconhecida" : idMinuta}
              </h3>
              {primeiroDetalhe?.praca && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                  Praça {primeiroDetalhe.praca}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{rota}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-12 flex-wrap">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Qtd. Minuta</p>
            <p className="text-lg font-black text-slate-700">{totalMinuta}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Bipados</p>
            <p className="text-lg font-black text-emerald-600">{bipados}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Faltantes</p>
            <p className={`text-lg font-black ${faltantes > 0 ? 'text-red-600' : 'text-slate-300'}`}>{faltantes}</p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/30 p-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Código de Barras</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Última Bipagem</th>
                  <th className="px-4 py-3 font-semibold">Ocorrência</th>
                  <th className="px-4 py-3 font-semibold">Manifesto</th>
                  <th className="px-4 py-3 font-semibold">Prev. Entrega</th>
                  <th className="px-4 py-3 font-semibold">Rota</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <DivRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RelatorioInventarioPage() {
  const params = useParams();
  const inventarioId = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, error } = api.inventory.obterRelatorioInventario.useQuery(
    { inventarioId },
    { enabled: !!inventarioId }
  );

  const unidadeId = data?.inventario?.unidade_id;
  const { data: nomeUnidade } = api.inventory.buscarNomeUnidade.useQuery(
    { unidade_id: unidadeId! },
    { enabled: !!unidadeId }
  );



  const divergenciasSeguras = useMemo(() => data?.divergencias ?? [], [data?.divergencias]);

  // Agrupar por minuta
  const minutasMap = useMemo(() => {
    const map = new Map<string, ItemInventario[]>();
    divergenciasSeguras.forEach(item => {
      const idMinuta = item.detalhe?.id_minuta ? String(item.detalhe.id_minuta) : "SEM_MINUTA";
      if (!map.has(idMinuta)) map.set(idMinuta, []);
      map.get(idMinuta)!.push(item);
    });
    // Ordenar as chaves por cidade de destino final (destino_nome)
    const chaves = Array.from(map.keys()).sort((a, b) => {
      if (a === "SEM_MINUTA") return 1;
      if (b === "SEM_MINUTA") return -1;
      
      const destinoA = map.get(a)?.[0]?.detalhe?.destino_nome ?? "";
      const destinoB = map.get(b)?.[0]?.detalhe?.destino_nome ?? "";
      
      const cmp = destinoA.localeCompare(destinoB);
      if (cmp !== 0) return cmp;
      
      // Desempate pelo número da minuta
      return parseInt(b) - parseInt(a);
    });

    return chaves.map(chave => ({
      idMinuta: chave,
      itens: map.get(chave)!
    }));
  }, [divergenciasSeguras]);

  const minutasBipadas = useMemo(() => {
    return minutasMap.filter(minuta =>
      minuta.itens.some(item => item.status_auditoria !== "FALTANTE")
    );
  }, [minutasMap]);

  // Contagem de minutas por praça
  const pracasCount = useMemo(() => {
    const counts = new Map<string, number>();
    minutasBipadas.forEach(m => {
      const primeiroDetalhe = m.itens.find(i => i.detalhe)?.detalhe;
      const praca = primeiroDetalhe?.praca || "SEM_PRACA";
      counts.set(praca, (counts.get(praca) || 0) + 1);
    });
    // Ordena do maior para o menor
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [minutasBipadas]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium animate-pulse">Gerando relatório de inventário...</p>
        </div>
      </div>
    );
  }

  if (error ?? !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
          <p className="text-slate-500 mb-6">{error?.message ?? "Inventário não encontrado"}</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  const { inventario } = data;

  const exportarParaExcel = () => {
    if (!divergenciasSeguras.length) return;

    const rows = divergenciasSeguras.map(item => {
      const rota = item.detalhe?.destino_nome && item.detalhe?.origem_nome
        ? `${item.detalhe.origem_nome} → ${item.detalhe.destino_nome}`
        : item.detalhe?.destino_nome ?? item.detalhe?.origem_nome ?? "—";

      const statusFormatado = item.status_auditoria === "FALTANTE" ? "Faltante" : "Lido";

      return {
        "Minuta": item.detalhe?.id_minuta ?? "—",
        "Código de Barras": item.codigo_barra,
        "Status": statusFormatado,
        "Última Bipagem": item.ultima_bipagem?.unidade_nome
          ? `${item.ultima_bipagem.tipo === "EMBARQUE" ? "Embarque" : "Desembarque"} - ${item.ultima_bipagem.unidade_nome}`
          : "—",
        "Situação Atual": item.ultima_ocorrencia?.id_oco != null
          ? (item.ultima_ocorrencia.descricao ?? `Código ${item.ultima_ocorrencia.id_oco}`)
          : "—",
        "Manifesto": item.detalhe?.id_manifesto ?? "—",
        "Prev. Entrega": formatDate(item.detalhe?.prev_entrega),
        "Rota": rota,
        "Registrado Em": new Date(item.criadoEm).toLocaleString("pt-BR")
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventário");

    const nomeArquivo = `Relatorio_Inventario_${inventario.id}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  };

  // Calcular métricas gerais
  const totalBipados = minutasBipadas.reduce((acc, m) => acc + m.itens.filter(i => i.status_auditoria !== "FALTANTE").length, 0);
  const totalMinutas = minutasBipadas.length > 0 && minutasBipadas[minutasBipadas.length - 1]?.idMinuta === "SEM_MINUTA"
    ? minutasBipadas.length - 1
    : minutasBipadas.length;
  const totalFaltantes = minutasBipadas.reduce((acc, m) => acc + m.itens.filter(i => i.status_auditoria === "FALTANTE").length, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 font-sans w-full">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8">

        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-700 transition-colors mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Painel de Unidades
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Image src="/cropped-icon.png" alt="Princesa" width={32} height={32} className="h-8 w-8" />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Relatório de Inventário
              </span>
              {inventario.status === "CONCLUIDO" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                  Finalizado
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                  Ainda Aberto
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-green-900">
                {nomeUnidade ? nomeUnidade.fantasia : `Unidade ${inventario.unidade_id}`}
              </h1>
              {inventario.praca_label && (
                <>
                  <span className="text-slate-300 text-2xl">/</span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-semibold uppercase tracking-wider">
                    PRAÇA {inventario.praca_label}
                  </span>
                </>
              )}
            </div>

            {nomeUnidade && (
              <p className="text-sm font-mono text-slate-400 mt-0.5">{nomeUnidade.sigla} · ID {inventario.unidade_id}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <button
              onClick={exportarParaExcel}
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl transition-colors border border-emerald-200 shadow-sm"
            >
              Excel
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-800 font-medium rounded-xl transition-colors border border-green-200"
            >
              Voltar ao Início
            </Link>
          </div>
        </header>

        {/* Cards de Métricas Simples */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Volumes Bipados
            </h3>
            <p className="text-5xl font-black text-indigo-600">{totalBipados}</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Qtd. de Minutas
            </h3>
            <p className="text-5xl font-black text-slate-800">{totalMinutas}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center w-full">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-3">
              Minutas por Praça
            </h3>
            <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto w-full">
              {pracasCount.length > 0 ? (
                pracasCount.map(([praca, count]) => (
                  <span key={praca} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold border border-slate-200">
                    {praca.toUpperCase()}: <span className="text-indigo-600">{count}</span>
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-sm">Nenhuma praça registrada</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-red-600 font-semibold text-sm uppercase tracking-wider mb-2">
              Volumes Faltantes
            </h3>
            <p className="text-5xl font-black text-red-600">{totalFaltantes}</p>
          </div>
        </div>

        {/* Minutas List */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Agrupamento por Minuta</h2>
              <p className="text-slate-500">Detalhes de todos os volumes conferidos nesta praça/unidade.</p>
            </div>
          </div>

          {minutasBipadas.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
              <h3 className="text-lg font-medium text-slate-800">Nenhuma Minuta Bipada</h3>
              <p className="text-slate-500 mt-1">Nenhum volume foi contabilizado neste inventário.</p>
            </div>
          ) : (
            minutasBipadas.map(minuta => (
              <MinutaGroup
                key={minuta.idMinuta}
                idMinuta={minuta.idMinuta}
                itens={minuta.itens}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
