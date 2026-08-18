"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { getOcorrenciaDescricao } from "@/utils/ocorrencias";

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
  minuta_status: number | null;
  cte_zero?: boolean;
} | null;

function StatusBadge({ status }: { status: string }) {
  if (status === "POSSIVEL_EXTRAVIO")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/50 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Possível Extravio
      </span>
    );
  if (status === "SOBRA_NA_BASE")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Sobra na Base
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/50 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Faltante
    </span>
  );
}

type UltimaBipagem = {
  unidade_nome: string | null;
  unidade_sigla: string | null;
  tipo: "EMBARQUE" | "DESEMBARQUE" | null;
  data: Date | null;
} | null;

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

function DivRow({ item }: { item: { id: string; codigo_barra: string; status_auditoria: string; criadoEm: Date; detalhe: Detalhe; ultima_bipagem?: UltimaBipagem; ultima_ocorrencia?: { id_oco: number | null; data_evento: Date | null; status: number | null } | null } }) {
  const rota = item.detalhe?.destino_nome && item.detalhe?.origem_nome
    ? `${item.detalhe.origem_nome} -> ${item.detalhe.destino_nome}`
    : item.detalhe?.destino_nome ?? item.detalhe?.origem_nome ?? "—";

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
      {/* Código */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
          {item.codigo_barra}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={item.status_auditoria} />
      </td>

      {/* Última Bipagem */}
      <td className="px-4 py-3">
        <UltimaBipagemBadge bipagem={item.ultima_bipagem ?? null} />
      </td>

      {/* Ocorrência */}
      <td className="px-4 py-3 whitespace-nowrap">
        {item.ultima_ocorrencia?.id_oco != null ? (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200">
            {getOcorrenciaDescricao(item.ultima_ocorrencia.id_oco)}
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Minuta */}
      <td className="px-4 py-3">
        {item.detalhe?.id_minuta ? (
          <span className="font-mono text-sm text-slate-700 font-medium">{item.detalhe.id_minuta}</span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Manifesto */}
      <td className="px-4 py-3">
        {item.detalhe?.id_manifesto ? (
          <span className="font-mono text-sm text-slate-700 font-medium">{item.detalhe.id_manifesto}</span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        )}
      </td>

      {/* Prev. Entrega */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-slate-600">{formatDate(item.detalhe?.prev_entrega)}</span>
      </td>

      {/* Rota */}
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600 leading-tight">{rota}</span>
      </td>

      {/* Registrado em */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-slate-400">
          {new Date(item.criadoEm).toLocaleString("pt-BR")}
        </span>
      </td>
    </tr>
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

  // Busca o nome da unidade para exibir no cabeçalho
  const unidadeId = data?.inventario?.unidade_id;
  const { data: nomeUnidade } = api.inventory.buscarNomeUnidade.useQuery(
    { unidade_id: unidadeId! },
    { enabled: !!unidadeId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium animate-pulse">Gerando relatório detalhado...</p>
        </div>
      </div>
    );
  }

  if (error ?? !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
          <p className="text-slate-500 mb-6">{error?.message ?? "Inventário não encontrado"}</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  const { inventario, contadores, divergencias } = data;

  // Separar os grupos para exibição por seção
  const faltantes  = divergencias.filter((d) => d.status_auditoria === "FALTANTE");
  const sobras     = divergencias.filter((d) => d.status_auditoria === "SOBRA_NA_BASE");
  const extravios  = divergencias.filter((d) => d.status_auditoria === "POSSIVEL_EXTRAVIO");

  const exportarParaExcel = () => {
    if (!divergencias.length) return;

    const rows = divergencias.map(item => {
      const rota = item.detalhe?.destino_nome && item.detalhe?.origem_nome
        ? `${item.detalhe.origem_nome} → ${item.detalhe.destino_nome}`
        : item.detalhe?.destino_nome ?? item.detalhe?.origem_nome ?? "—";

      let statusFormatado = item.status_auditoria;
      if (item.status_auditoria === "POSSIVEL_EXTRAVIO") statusFormatado = "Possível Extravio";
      if (item.status_auditoria === "SOBRA_NA_BASE") statusFormatado = "Sobra na Base";
      if (item.status_auditoria === "FALTANTE") statusFormatado = "Faltante";

      return {
        "Código de Barras": item.codigo_barra,
        "Status": statusFormatado,
        "Última Bipagem": item.ultima_bipagem?.unidade_nome
          ? `${item.ultima_bipagem.tipo === "EMBARQUE" ? "Embarque" : "Desembarque"} - ${item.ultima_bipagem.unidade_nome}`
          : "—",
        "Ocorrência": item.ultima_ocorrencia?.id_oco != null ? getOcorrenciaDescricao(item.ultima_ocorrencia.id_oco) : "—",
        "Minuta": item.detalhe?.id_minuta ?? "—",
        "Manifesto": item.detalhe?.id_manifesto ?? "—",
        "Prev. Entrega": formatDate(item.detalhe?.prev_entrega),
        "Rota": rota,
        "Registrado Em": new Date(item.criadoEm).toLocaleString("pt-BR")
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Divergências");

    const nomeArquivo = `Relatorio_Inventario_${inventario.id}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 sm:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Painel de Unidades
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Relatório de Fechamento
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              {nomeUnidade ? nomeUnidade.fantasia : `Unidade ${inventario.unidade_id}`}
            </h1>
            {nomeUnidade && (
              <p className="text-sm font-mono text-slate-400 mt-0.5">{nomeUnidade.sigla} · ID {inventario.unidade_id}</p>
            )}
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(inventario.criadoEm).toLocaleDateString("pt-BR")}
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs">ID: {inventario.id}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportarParaExcel}
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl transition-colors border border-emerald-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors border border-slate-300 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-colors border border-indigo-200"
            >
              Painel de Unidades
            </Link>
          </div>
        </header>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Corretos */}
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-emerald-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-emerald-800 font-medium text-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Corretos
            </h3>
            <p className="text-4xl font-bold text-emerald-900 mt-3 relative z-10">{contadores.corretos}</p>
            <p className="text-sm text-emerald-600 mt-1 relative z-10">Bipados no local certo</p>
          </div>

          {/* Sobras */}
          <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-amber-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-amber-800 font-medium text-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              Sobras
            </h3>
            <p className="text-4xl font-bold text-amber-900 mt-3 relative z-10">{contadores.sobras}</p>
            <p className="text-sm text-amber-600 mt-1 relative z-10">Fisicamente aqui, não deveriam</p>
          </div>

          {/* Faltantes */}
          <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-red-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-red-800 font-medium text-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Faltantes
            </h3>
            <p className="text-4xl font-bold text-red-900 mt-3 relative z-10">{contadores.faltantes}</p>
            <p className="text-sm text-red-600 mt-1 relative z-10">Deveriam estar, não achados</p>
          </div>

          {/* Extravios */}
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-purple-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-purple-800 font-medium text-sm flex items-center">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              Possível Extravio
            </h3>
            <p className="text-4xl font-bold text-purple-900 mt-3 relative z-10">{contadores.extravios}</p>
            <p className="text-sm text-purple-600 mt-1 relative z-10">Bipado mas já finalizado/entregue</p>
          </div>
        </div>

        {/* Tabela de Divergências */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Detalhamento de Divergências</h2>
              <p className="text-sm text-slate-500 mt-0.5">Use esta lista para procuras físicas no galpão</p>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              {divergencias.length} itens divergentes
            </span>
          </div>

          <div className="overflow-x-auto">
            {divergencias.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800">Inventário Perfeito!</h3>
                <p className="text-slate-500 mt-1">Nenhuma sobra ou falta foi registrada nesta unidade.</p>
              </div>
            ) : (
              <>
                {/* Legenda de seções */}
                {faltantes.length > 0 && (
                  <div className="px-6 py-3 bg-red-50/60 border-b border-red-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                      Faltantes — {faltantes.length} volumes
                    </span>
                  </div>
                )}
                {faltantes.length > 0 && (
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 font-semibold">Código de Barras</th>
                        <th className="px-4 py-3 font-semibold">Tipo</th>
                        <th className="px-4 py-3 font-semibold">Última Bipagem</th>
                        <th className="px-4 py-3 font-semibold">Ocorrência</th>
                        <th className="px-4 py-3 font-semibold">Minuta</th>
                        <th className="px-4 py-3 font-semibold">Manifesto</th>
                        <th className="px-4 py-3 font-semibold">Prev. Entrega</th>
                        <th className="px-4 py-3 font-semibold">Rota</th>
                        <th className="px-4 py-3 font-semibold">Registrado Em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faltantes.map((item) => (
                        <DivRow key={item.id} item={item} />
                      ))}
                    </tbody>
                  </table>
                )}

                {sobras.length > 0 && (
                  <div className="px-6 py-3 bg-amber-50/60 border-y border-amber-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Sobras — {sobras.length} volumes
                    </span>
                  </div>
                )}
                {sobras.length > 0 && (
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 font-semibold">Código de Barras</th>
                        <th className="px-4 py-3 font-semibold">Tipo</th>
                        <th className="px-4 py-3 font-semibold">Última Bipagem</th>
                        <th className="px-4 py-3 font-semibold">Ocorrência</th>
                        <th className="px-4 py-3 font-semibold">Minuta</th>
                        <th className="px-4 py-3 font-semibold">Manifesto</th>
                        <th className="px-4 py-3 font-semibold">Prev. Entrega</th>
                        <th className="px-4 py-3 font-semibold">Rota</th>
                        <th className="px-4 py-3 font-semibold">Registrado Em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sobras.map((item) => (
                        <DivRow key={item.id} item={item} />
                      ))}
                    </tbody>
                  </table>
                )}

                {extravios.length > 0 && (
                  <div className="px-6 py-3 bg-purple-50/60 border-y border-purple-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Possível Extravio — {extravios.length} volumes
                    </span>
                  </div>
                )}
                {extravios.length > 0 && (
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 font-semibold">Código de Barras</th>
                        <th className="px-4 py-3 font-semibold">Tipo</th>
                        <th className="px-4 py-3 font-semibold">Última Bipagem</th>
                        <th className="px-4 py-3 font-semibold">Ocorrência</th>
                        <th className="px-4 py-3 font-semibold">Minuta</th>
                        <th className="px-4 py-3 font-semibold">Manifesto</th>
                        <th className="px-4 py-3 font-semibold">Prev. Entrega</th>
                        <th className="px-4 py-3 font-semibold">Rota</th>
                        <th className="px-4 py-3 font-semibold">Registrado Em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extravios.map((item) => (
                        <DivRow key={item.id} item={item} />
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
