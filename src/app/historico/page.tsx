"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconFilter = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export default function HistoricoPage() {
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [unidadeId, setUnidadeId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filtro debounced para evitar muitas requisições
  const { data: unidades } = api.inventory.listarUnidadesSimples.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const { data: historico, isLoading } = api.inventory.listarHistorico.useQuery({
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    unidade_id: unidadeId ? Number(unidadeId) : undefined,
    page,
    pageSize
  });

  const limparFiltros = () => {
    setDataInicio("");
    setDataFim("");
    setUnidadeId("");
    setPage(1);
  };

  const unidadesMap = new Map(unidades?.map(u => [u.id, u]));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico de Inventários</h1>
            <p className="text-slate-500 mt-1">Consulte o histórico detalhado de todas as contagens realizadas.</p>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Unidade</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <IconSearch />
              </span>
              <select 
                value={unidadeId} 
                onChange={(e) => { setUnidadeId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
              >
                <option value="">Todas as unidades</option>
                {unidades?.map(u => (
                  <option key={u.id} value={u.id}>{u.fantasia} ({u.sigla})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Início</label>
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => { setDataInicio(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Fim</label>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => { setDataFim(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <button 
            onClick={limparFiltros}
            className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <IconFilter /> Limpar
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <th className="px-6 py-4">Inventário</th>
                  <th className="px-6 py-4">Unidade</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Bipados</th>
                  <th className="px-6 py-4 text-center text-emerald-600">Corretos</th>
                  <th className="px-6 py-4 text-center text-orange-600">Divergências</th>
                  <th className="px-6 py-4 text-center text-red-600">Extravios</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 animate-pulse">Carregando histórico...</td>
                  </tr>
                ) : !historico || historico.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">Nenhum inventário encontrado para os filtros selecionados.</td>
                  </tr>
                ) : (
                  historico.items.map((inv) => {
                    const unidade = unidadesMap.get(inv.unidade_id);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono font-medium text-slate-700 text-xs">{inv.id}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(inv.criadoEm).toLocaleString('pt-BR')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{unidade?.fantasia?.replace(/^PRI\s+/i, "") ?? `Unidade ${inv.unidade_id}`}</p>
                          <p className="text-xs text-slate-500">{unidade?.sigla ?? '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {inv.status === "EM_ANDAMENTO" || inv.status === "ABERTO" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">Em Andamento</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">Concluído</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{inv.bipados}</td>
                        <td className="px-6 py-4 text-center font-medium text-emerald-600">{inv.corretos}</td>
                        <td className="px-6 py-4 text-center font-medium text-orange-600">{inv.divergentes}</td>
                        <td className="px-6 py-4 text-center font-medium text-red-600">{inv.extravios}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={inv.status === "ABERTO" ? `/inventario/${inv.id}` : `/inventario/${inv.id}/relatorio`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            Abrir ↗
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {historico && historico.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando página <span className="font-semibold text-slate-700">{historico.currentPage}</span> de <span className="font-semibold text-slate-700">{historico.totalPages}</span>
                {" "}({historico.totalCount} registros)
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(historico.totalPages, p + 1))}
                  disabled={page === historico.totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
