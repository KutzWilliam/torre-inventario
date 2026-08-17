"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";

// ─── Ícones inline ────────────────────────────────────────────────────────────
const IconWarehouse = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 22V12h6v10" />
  </svg>
);

const IconTruck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M1 1h15v13H1V1zm15 5h4l3 3v5h-7V6z" />
  </svg>
);

const IconBox = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconSpin = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ─── Modal de confirmação de novo inventário ──────────────────────────────────
interface ModalNovoInventarioProps {
  unidade: { id_unidade: number; fantasia: string; sigla: string } | null;
  onConfirm: (unidadeId: number) => void;
  onClose: () => void;
  isPending: boolean;
}

function ModalNovoInventario({ unidade, onConfirm, onClose, isPending }: ModalNovoInventarioProps) {
  if (!unidade) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <IconX />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <IconBox />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-0.5">
              Novo Inventário
            </p>
            <h2 className="text-xl font-bold text-slate-800">Confirmar Unidade</h2>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-medium">Unidade selecionada</p>
          <p className="text-lg font-bold text-slate-800">{unidade.fantasia}</p>
          <p className="text-sm text-slate-500 font-mono mt-0.5">{unidade.sigla} · ID {unidade.id_unidade}</p>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Será iniciada uma nova sessão de contagem para esta unidade. Você poderá retomá-la a qualquer momento.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(unidade.id_unidade)}
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <IconSpin /> : <IconPlus />}
            {isPending ? "Criando..." : "Iniciar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card de Unidade ──────────────────────────────────────────────────────────
interface UnidadeCardProps {
  unidade: {
    id_unidade: number;
    fantasia: string;
    sigla: string;
    total_volumes: number;
    no_patio: number;
    em_viagem: number;
  };
  onIniciarInventario: (unidade: { id_unidade: number; fantasia: string; sigla: string }) => void;
}

function UnidadeCard({ unidade, onIniciarInventario }: UnidadeCardProps) {
  const porcentagemPatio = unidade.total_volumes > 0
    ? Math.round((unidade.no_patio / unidade.total_volumes) * 100)
    : 0;

  // Limpa o nome removendo prefixo "PRI " para exibição principal
  const nomeDisplay = unidade.fantasia.replace(/^PRI\s+/i, "");

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Barra de progresso no topo */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${porcentagemPatio}%` }}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">
              {unidade.sigla}
            </p>
            <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
              {nomeDisplay}
            </h3>
          </div>
          <div className="flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-xl px-3 py-1.5 text-center min-w-[52px]">
            <p className="text-xl font-black leading-none">{unidade.total_volumes}</p>
            <p className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">total</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
          {/* No Pátio */}
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
              <IconWarehouse />
              <span className="text-[10px] font-bold uppercase tracking-wider">No Pátio</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{unidade.no_patio}</p>
            <p className="text-[10px] text-emerald-600/70 mt-0.5">
              {porcentagemPatio}% do total
            </p>
          </div>

          {/* Em Viagem */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-2 mb-1.5 text-amber-600">
              <IconTruck />
              <span className="text-[10px] font-bold uppercase tracking-wider">Em Viagem</span>
            </div>
            <p className="text-2xl font-black text-amber-700">{unidade.em_viagem}</p>
            <p className="text-[10px] text-amber-600/70 mt-0.5">a caminho</p>
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={() => onIniciarInventario(unidade)}
          className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-indigo-600"
        >
          <IconPlus />
          Iniciar Inventário
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function UnidadeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-100" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-2 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-36 bg-slate-100 rounded" />
          </div>
          <div className="w-14 h-14 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [modalUnidade, setModalUnidade] = useState<{
    id_unidade: number;
    fantasia: string;
    sigla: string;
  } | null>(null);

  // Dashboard de unidades com volumes ativos
  const {
    data: unidades,
    isLoading: loadingUnidades,
    error: errorUnidades,
    refetch: refetchUnidades,
  } = api.inventory.listarUnidadesComVolumes.useQuery(undefined, {
    refetchInterval: 2 * 60 * 1000, // Atualiza a cada 2 minutos
    staleTime: 60 * 1000,
  });

  // Lista de inventários recentes
  const { data: inventarios, isLoading: loadingInventarios } =
    api.inventory.listarInventarios.useQuery();

  // Mutation para criar inventário
  const criarMutation = api.inventory.criarInventario.useMutation({
    onSuccess: (data) => {
      router.push(`/inventario/${data.id}`);
    },
  });

  const handleConfirmarInventario = (unidadeId: number) => {
    if (criarMutation.isPending) return;
    criarMutation.mutate({ unidade_id: unidadeId });
  };

  // Filtro de busca
  const unidadesFiltradas = (unidades ?? []).filter((u) => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return (
      u.fantasia.toLowerCase().includes(q) ||
      u.sigla.toLowerCase().includes(q) ||
      String(u.id_unidade).includes(q)
    );
  });

  // Totalizadores
  const totais = (unidades ?? []).reduce(
    (acc, u) => ({
      unidades: acc.unidades + 1,
      volumes: acc.volumes + u.total_volumes,
      patio: acc.patio + u.no_patio,
      viagem: acc.viagem + u.em_viagem,
    }),
    { unidades: 0, volumes: 0, patio: 0, viagem: 0 }
  );

  return (
    <>
      {/* Modal */}
      {modalUnidade && (
        <ModalNovoInventario
          unidade={modalUnidade}
          onConfirm={handleConfirmarInventario}
          onClose={() => setModalUnidade(null)}
          isPending={criarMutation.isPending}
        />
      )}

      <div className="min-h-screen text-slate-900 font-sans"
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ── Header ── */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <IconBox />
                  {/* Ícone branco */}
                  <span className="sr-only">Torre Inventário</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                  Torre de Controle
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Painel de Unidades
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Volumes ativos nos últimos 90 dias · Atualização automática a cada 2 min
              </p>
            </div>

            <button
              onClick={() => void refetchUnidades()}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl border border-slate-200 shadow-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </header>

          {/* ── Cards de totais ── */}
          {!loadingUnidades && !errorUnidades && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Unidades Ativas", value: totais.unidades, color: "indigo", icon: "🏢" },
                { label: "Volumes Totais", value: totais.volumes, color: "slate", icon: "📦" },
                { label: "No Pátio", value: totais.patio, color: "emerald", icon: "🏭" },
                { label: "Em Viagem", value: totais.viagem, color: "amber", icon: "🚛" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
                >
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-2xl font-black text-slate-800">{item.value.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Dashboard de unidades ── */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800">
                Unidades com Volumes Ativos
                {!loadingUnidades && (
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({unidadesFiltradas.length} unidades)
                  </span>
                )}
              </h2>

              {/* Busca */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar unidade..."
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all w-full sm:w-56"
                />
              </div>
            </div>

            {/* Erro */}
            {errorUnidades && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-medium">Erro ao carregar unidades</p>
                <p className="text-red-400 text-sm mt-1">{errorUnidades.message}</p>
                <button
                  onClick={() => void refetchUnidades()}
                  className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Grid de cards */}
            {loadingUnidades ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <UnidadeCardSkeleton key={i} />
                ))}
              </div>
            ) : unidadesFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  {busca ? "Nenhuma unidade encontrada" : "Nenhum volume ativo"}
                </h3>
                <p className="text-slate-400 text-sm">
                  {busca
                    ? `Nenhuma unidade corresponde a "${busca}"`
                    : "Não há volumes com minuta ativa nos últimos 90 dias."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unidadesFiltradas.map((unidade) => (
                  <UnidadeCard
                    key={unidade.id_unidade}
                    unidade={unidade}
                    onIniciarInventario={setModalUnidade}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Histórico de inventários ── */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Histórico de Inventários
            </h2>

            {loadingInventarios ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/50 animate-pulse h-20 rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : inventarios?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
                Nenhum inventário realizado ainda. Use os cards acima para iniciar.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {inventarios?.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 text-indigo-600 rounded-xl px-3 py-2 text-center min-w-[60px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Unidade</span>
                        <span className="text-lg font-black">{inv.unidade_id}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-slate-400">#{inv.id.slice(-6)}</span>
                          {inv.status === "ABERTO" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Em andamento
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                              Concluído
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>
                            {new Date(inv.criadoEm).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-medium text-slate-700">
                            {inv._count.itens} itens
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {inv.status === "ABERTO" ? (
                        <Link
                          href={`/inventario/${inv.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl transition-colors border border-emerald-200"
                        >
                          Retomar Bipagem
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ) : (
                        <Link
                          href={`/inventario/${inv.id}/relatorio`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl transition-colors border border-slate-200"
                        >
                          Ver Relatório
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
