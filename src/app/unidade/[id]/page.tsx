"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// ─── Ícones ───────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconSpinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ─── Modal de seleção de praça ─────────────────────────────────────────────────
function ModalSelecionarPraca({
  pracas,
  loadingPracas,
  onSelecionar,
  onFechar,
  isPending,
  pracaSelecionada,
}: {
  pracas: string[];
  loadingPracas: boolean;
  onSelecionar: (pracaId: string | null, pracaLabel: string) => void;
  onFechar: () => void;
  isPending: boolean;
  pracaSelecionada: string | null;
}) {
  const [busca, setBusca] = useState("");

  const pracasFiltradas = busca.trim()
    ? pracas.filter(p => p.toLowerCase().includes(busca.toLowerCase()))
    : pracas;

  type Opcao = { id: string | null; label: string; descricao: string; geral: boolean };

  const opcoes: Opcao[] = [
    { id: null, label: "Geral", descricao: "Inventário sem praça específica", geral: true },
    ...pracasFiltradas.map(p => ({ id: p, label: p, descricao: `Praça ${p}`, geral: false })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isPending) onFechar(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Iniciar Inventário</h2>
            <p className="text-sm text-slate-500 mt-0.5">Selecione a praça ou inicie um inventário geral</p>
          </div>
          <button
            onClick={onFechar}
            disabled={isPending}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <IconX />
          </button>
        </div>

        {/* Busca */}
        <div className="px-6 py-3 flex-shrink-0 border-b border-slate-50">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar praça..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1.5">
          {loadingPracas ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <IconSpinner />
              <span className="ml-2 text-sm">Carregando praças...</span>
            </div>
          ) : opcoes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma praça encontrada.</p>
          ) : (
            opcoes.map((opcao) => {
              const isThis = isPending && pracaSelecionada === (opcao.id ?? "__GERAL__");
              return (
                <button
                  key={opcao.id ?? "__GERAL__"}
                  onClick={() => onSelecionar(opcao.id, opcao.label)}
                  disabled={isPending}
                  className={[
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 text-left group",
                    opcao.geral
                      ? "border-indigo-100 bg-indigo-50/60 hover:border-indigo-400 hover:bg-indigo-50"
                      : "border-slate-100 bg-slate-50/40 hover:border-green-400 hover:bg-green-50/40",
                    isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className={[
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold",
                      opcao.geral ? "bg-indigo-100 text-indigo-600" : "bg-green-100 text-green-700",
                    ].join(" ")}>
                      {opcao.geral ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      ) : (
                        <span>{opcao.label.slice(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <p className={[
                        "font-semibold text-sm",
                        opcao.geral ? "text-indigo-900" : "text-slate-800",
                      ].join(" ")}>
                        {opcao.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{opcao.descricao}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    {isThis ? <IconSpinner /> : (
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-6 pb-5 pt-2 flex-shrink-0 border-t border-slate-50">
          <button
            onClick={onFechar}
            disabled={isPending}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Badge de status ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "ABERTO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Em Andamento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Concluído
    </span>
  );
}

function formatarDataHora(d: Date) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function UnidadePage() {
  const params = useParams();
  const router = useRouter();
  const unidadeId = typeof params.id === "string" ? parseInt(params.id, 10) : 0;

  const [modalAberto, setModalAberto] = useState(false);
  const [pracaSelecionada, setPracaSelecionada] = useState<string | null>(null);

  const trpcUtils = api.useUtils();

  const { data: nomeUnidade, isLoading: loadingNome } = api.inventory.buscarNomeUnidade.useQuery(
    { unidade_id: unidadeId },
    { enabled: !!unidadeId }
  );

  const { data: pracas = [], isLoading: loadingPracas } = api.inventory.listarPracas.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // cache 10min — raramente muda
  });

  const { data: inventarios = [], isLoading: loadingInventarios } = api.inventory.listarInventariosDaUnidade.useQuery(
    { unidade_id: unidadeId },
    { enabled: !!unidadeId }
  );

  const criarMutation = api.inventory.criarInventario.useMutation({
    onSuccess: (data) => {
      setModalAberto(false);
      setPracaSelecionada(null);
      router.push(`/inventario/${data.id}`);
    },
    onError: (err) => {
      setPracaSelecionada(null);
      alert(`Erro ao criar inventário: ${err.message}`);
    },
    onSettled: () => {
      void trpcUtils.inventory.listarInventariosDaUnidade.invalidate({ unidade_id: unidadeId });
    },
  });

  const handleSelecionar = (pracaId: string | null, pracaLabel: string) => {
    if (criarMutation.isPending) return;
    const key = pracaId ?? "__GERAL__";
    setPracaSelecionada(key);

    criarMutation.mutate({
      unidade_id: unidadeId,
      ...(pracaId ? { praca: pracaId, praca_label: pracaLabel } : {}),
    });
  };

  const abertos = inventarios.filter(i => i.status === "ABERTO");
  const concluidos = inventarios.filter(i => i.status === "CONCLUIDO");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* ── Header ── */}
        <header className="bg-white px-6 sm:px-8 py-6 rounded-3xl shadow-sm border border-slate-200">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-700 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Painel de Unidades
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Image src="/cropped-icon.png" alt="Princesa" width={28} height={28} className="h-7 w-7" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Torre de Inventário
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-green-900">
                {loadingNome ? "Carregando..." : (nomeUnidade?.fantasia ?? `Unidade ${unidadeId}`)}
              </h1>
              {nomeUnidade && (
                <p className="text-sm font-mono text-slate-400 mt-0.5">{nomeUnidade.sigla} · ID {unidadeId}</p>
              )}
            </div>

            <button
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-bold rounded-2xl transition-all shadow-md shadow-green-900/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Iniciar Inventário
            </button>
          </div>
        </header>

        {/* ── Em Andamento ── */}
        {(loadingInventarios || abertos.length > 0) && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              Em Andamento
              {abertos.length > 0 && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {abertos.length}
                </span>
              )}
            </h2>

            {loadingInventarios ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {abertos.map(inv => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl border border-amber-200/60 shadow-sm px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm leading-none">
                          {inv.praca_label ?? "Inventário Geral"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {inv.totalItens} vol. bipado{inv.totalItens !== 1 ? "s" : ""} · Iniciado em {formatarDataHora(inv.criadoEm)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={inv.status} />
                      <Link
                        href={`/inventario/${inv.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-colors"
                      >
                        Continuar →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Histórico / Concluídos ── */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Histórico
            {concluidos.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {concluidos.length}
              </span>
            )}
          </h2>

          {loadingInventarios ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : concluidos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-400">Nenhum inventário concluído ainda</p>
              <p className="text-xs text-slate-400 mt-1">Os relatórios finalizados aparecerão aqui.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    <th className="px-5 py-3">Praça / Tipo</th>
                    <th className="px-5 py-3 text-center">Bipados</th>
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {concluidos.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-semibold text-slate-700 text-sm">
                            {inv.praca_label ?? "Geral"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {inv.totalItens}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-500">{formatarDataHora(inv.criadoEm)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/inventario/${inv.id}/relatorio`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-900 transition-colors opacity-70 group-hover:opacity-100"
                        >
                          Ver Relatório
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* ── Modal ── */}
      {modalAberto && (
        <ModalSelecionarPraca
          pracas={pracas}
          loadingPracas={loadingPracas}
          onSelecionar={handleSelecionar}
          onFechar={() => {
            if (!criarMutation.isPending) {
              setModalAberto(false);
              setPracaSelecionada(null);
            }
          }}
          isPending={criarMutation.isPending}
          pracaSelecionada={pracaSelecionada}
        />
      )}
    </div>
  );
}
