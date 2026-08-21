"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";

// ─── Ícones inline ────────────────────────────────────────────────────────────
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <IconX />
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <IconBox />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-0.5">Novo Inventário</p>
            <h2 className="text-xl font-bold text-slate-800">Confirmar Unidade</h2>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-medium">Unidade selecionada</p>
          <p className="text-lg font-bold text-slate-800">{unidade.fantasia}</p>
          <p className="text-sm text-slate-500 font-mono mt-0.5">{unidade.sigla} · ID {unidade.id_unidade}</p>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Será iniciada uma nova sessão de contagem para esta unidade.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isPending} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={() => onConfirm(unidade.id_unidade)} disabled={isPending} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isPending ? <IconSpin /> : <IconPlus />}
            {isPending ? "Criando..." : "Iniciar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componentes Gráficos ─────────────────────────────────────────────────────
function SegmentedDonutChart({ 
  segments, 
  total, 
  size = 140, 
  strokeWidth = 14 
}: { 
  segments: { value: number, color: string }[], 
  total: number, 
  size?: number, 
  strokeWidth?: number 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {segments.map((seg, idx) => {
          if (seg.value === 0 || total === 0) return null;
          const percent = seg.value / total;
          const dash = percent * circumference;
          const gap = circumference - dash;
          const offset = currentOffset;
          currentOffset -= dash;
          
          return (
            <circle 
              key={idx}
              cx={size / 2} cy={size / 2} r={radius} 
              fill="transparent" 
              stroke={seg.color} 
              strokeWidth={strokeWidth} 
              strokeDasharray={`${dash} ${gap}`} 
              strokeDashoffset={offset} 
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-out" 
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-slate-800 leading-none">{total}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">TOTAL</span>
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

  const nomeDisplay = unidade.fantasia.replace(/^PRI\s+/i, "");

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${porcentagemPatio}%` }}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
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

        <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
              <IconWarehouse />
              <span className="text-[10px] font-bold uppercase tracking-wider">No Pátio</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{unidade.no_patio}</p>
            <p className="text-[10px] text-emerald-600/70 mt-0.5">{porcentagemPatio}% do total</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-2 mb-1.5 text-amber-600">
              <IconTruck />
              <span className="text-[10px] font-bold uppercase tracking-wider">Em Viagem</span>
            </div>
            <p className="text-2xl font-black text-amber-700">{unidade.em_viagem}</p>
            <p className="text-[10px] text-amber-600/70 mt-0.5">a caminho</p>
          </div>
        </div>

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


// ─── Helper de Data ──────────────────────────────────────────────────────────
const hojeStr = new Date().toISOString().split('T')[0];

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  // dataStr default is today YYYY-MM-DD
  const [dataStr, setDataStr] = useState<string>(hojeStr!);
  const [modalUnidade, setModalUnidade] = useState<{ id_unidade: number; fantasia: string; sigla: string } | null>(null);

  // Queries
  const { data: dashboard, isLoading: loadingDash } = api.inventory.obterDashboard.useQuery({ data: dataStr });
  const { data: unidades, isLoading: loadingUnidades } = api.inventory.listarUnidadesComVolumes.useQuery(undefined, {
    refetchInterval: 2 * 60 * 1000,
  });

  const criarMutation = api.inventory.criarInventario.useMutation({
    onSuccess: (data) => router.push(`/inventario/${data.id}`),
  });

  const handleConfirmarInventario = (unidadeId: number) => {
    if (criarMutation.isPending) return;
    criarMutation.mutate({ unidade_id: unidadeId });
  };

  const unidadesAtivas = unidades?.length ?? 0;
  
  // Segmentos Donut
  const concluidos = dashboard?.kpis.inventariosConcluidos ?? 0;
  const emAndamento = dashboard?.kpis.inventariosEmAndamento ?? 0;
  const naoIniciados = Math.max(0, unidadesAtivas - (concluidos + emAndamento));

  return (
    <>
      {modalUnidade && (
        <ModalNovoInventario
          unidade={modalUnidade}
          onConfirm={handleConfirmarInventario}
          onClose={() => setModalUnidade(null)}
          isPending={criarMutation.isPending}
        />
      )}

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão geral</h1>
              <p className="text-slate-500 mt-1">Acompanhe o status dos inventários da sua operação.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/historico" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg shadow-sm transition-colors border border-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Ver histórico
              </Link>
              <button onClick={() => setModalUnidade({ id_unidade: 0, fantasia: "Selecionar na próxima tela", sigla: "..." })} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                <IconBox /> Novo inventário
              </button>
            </div>
          </header>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Unidades monitoradas</p>
                <p className="text-3xl font-bold text-slate-900">{unidades?.length ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">{unidadesAtivas} ativas agora</p>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <input 
                  type="date"
                  value={dataStr}
                  onChange={(e) => setDataStr(e.target.value)}
                  className="text-xs font-medium text-slate-500 bg-transparent border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer hover:border-slate-300"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Inventários no dia</p>
                <p className="text-3xl font-bold text-slate-900">{loadingDash ? "..." : dashboard?.kpis.inventariosNoPeriodo}</p>
                <p className="text-xs text-slate-400 mt-1">{loadingDash ? "..." : dashboard?.kpis.inventariosEmAndamento} em andamento</p>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Divergências no dia</p>
                <p className="text-3xl font-bold text-slate-900">{loadingDash ? "..." : dashboard?.kpis.divergenciasAbertas}</p>
                <p className="text-xs text-slate-400 mt-1">{loadingDash ? "..." : dashboard?.kpis.divergenciasCriticas} críticas</p>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                  <IconBox />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Itens conferidos</p>
                <p className="text-3xl font-bold text-slate-900">{loadingDash ? "..." : dashboard?.kpis.itensConferidos.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-slate-400 mt-1">no dia selecionado</p>
              </div>
            </div>
          </div>

          {/* Row 2: Andamento e Pontos de Atenção */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Andamento dos inventários */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Andamento dos inventários</h2>
                  <p className="text-sm text-slate-500">Distribuição por status para a data selecionada</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-10 sm:pl-4">
                {loadingDash || loadingUnidades ? (
                  <div className="w-[140px] h-[140px] rounded-full bg-slate-100 animate-pulse" />
                ) : (
                  <SegmentedDonutChart 
                    total={unidadesAtivas}
                    segments={[
                      { value: concluidos, color: "#10b981" }, // Verde
                      { value: emAndamento, color: "#3b82f6" }, // Azul
                      { value: naoIniciados, color: "#cbd5e1" }, // Cinza
                    ]}
                  />
                )}

                <div className="flex-1 space-y-4 w-full">
                  {/* Concluídos */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-slate-600">Concluídos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{concluidos}</span>
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {unidadesAtivas === 0 ? "0%" : `${Math.round((concluidos / unidadesAtivas) * 100)}%`}
                      </span>
                    </div>
                  </div>
                  {/* Em andamento */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-slate-600">Em andamento</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{emAndamento}</span>
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {unidadesAtivas === 0 ? "0%" : `${Math.round((emAndamento / unidadesAtivas) * 100)}%`}
                      </span>
                    </div>
                  </div>
                  {/* Não iniciados */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="text-sm font-medium text-slate-600">Não iniciados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{naoIniciados}</span>
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {unidadesAtivas === 0 ? "0%" : `${Math.round((naoIniciados / unidadesAtivas) * 100)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pontos de atenção */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pontos de atenção</h2>
                  <p className="text-sm text-slate-500">Itens que precisam de acompanhamento</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {/* Críticas */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Divergências críticas</p>
                      <p className="text-xs text-slate-500">ocorrências acima do limite</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{loadingDash ? "..." : dashboard?.pontosAtencao.divergenciasCriticas}</span>
                </div>

                {/* Extraviados */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Itens extraviados</p>
                      <p className="text-xs text-slate-500">itens sem localização</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{loadingDash ? "..." : dashboard?.pontosAtencao.itensExtraviados}</span>
                </div>

                {/* Atrasados */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Inventários atrasados</p>
                      <p className="text-xs text-slate-500">sem atualização {'>'} 24h</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{loadingDash ? "..." : dashboard?.pontosAtencao.inventariosAtrasados}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Atividade e Gráfico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Atividade recente */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Atividade recente</h2>
              <div className="space-y-6">
                {loadingDash ? (
                  <div className="text-sm text-slate-400">Carregando...</div>
                ) : dashboard?.atividadeRecente.length === 0 ? (
                  <div className="text-sm text-slate-400">Nenhuma atividade registrada.</div>
                ) : (
                  dashboard?.atividadeRecente.map((atv, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                        {atv.status === "CONCLUIDO" ? (
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <IconBox />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {atv.status === "CONCLUIDO" ? "Inventário concluído" : "Inventário iniciado"}
                        </p>
                        <p className="text-xs text-slate-500">Unidade {atv.unidade_id} · {atv.itens} itens</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(atv.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resumo de conferência */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900">Resumo de conferência</h2>
              <p className="text-sm text-slate-500 mb-8">Performance de acuracidade média mensal</p>

              <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto pt-6 border-b border-slate-100 relative">
                {loadingDash ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Carregando dados...</div>
                ) : (
                  dashboard?.resumoConferencia.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group w-full h-full justify-end relative">
                      <div className="w-full max-w-[40px] bg-blue-500 rounded-t-sm transition-all relative overflow-hidden hover:bg-blue-600" style={{ height: `${item.taxa}%`, minHeight: '4px' }}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 uppercase">{item.mes}</span>
                      <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {item.taxa.toFixed(1)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Unidades em Cards (Layout Antigo) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Unidades com Volumes Ativos</h2>
            {loadingUnidades ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-[250px] bg-white rounded-2xl border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : unidades?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
                Nenhum volume ativo.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {unidades?.map((unidade) => (
                  <UnidadeCard
                    key={unidade.id_unidade}
                    unidade={unidade}
                    onIniciarInventario={setModalUnidade}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Row 5: Nova Tabela de Status dos Inventários */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Status dos Inventários</h2>
                <p className="text-sm text-slate-500">Detalhamento para o dia {dataStr.split('-').reverse().join('/')}</p>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar unidade..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <th className="px-6 py-4">Unidade</th>
                    <th className="px-6 py-4">Status no Dia</th>
                    <th className="px-6 py-4 text-center">Esperado (Pátio)</th>
                    <th className="px-6 py-4 text-center">Bipados</th>
                    <th className="px-6 py-4 text-center">Corretos</th>
                    <th className="px-6 py-4 text-center text-orange-600">Divergências</th>
                    <th className="px-6 py-4 text-center text-red-600">Extravios</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingUnidades || loadingDash ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-400 animate-pulse">Carregando dados...</td>
                    </tr>
                  ) : (
                    (unidades ?? []).filter(u => 
                      !busca.trim() || 
                      u.fantasia.toLowerCase().includes(busca.toLowerCase()) || 
                      u.sigla.toLowerCase().includes(busca.toLowerCase()) || 
                      String(u.id_unidade).includes(busca)
                    ).map((u) => {
                      const inv = dashboard?.inventariosDoDia?.find(i => i.unidade_id === u.id_unidade);
                      
                      return (
                        <tr key={u.id_unidade} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{u.fantasia.replace(/^PRI\s+/i, "")}</p>
                            <p className="text-xs text-slate-500">{u.sigla}</p>
                          </td>
                          <td className="px-6 py-4">
                            {!inv ? (
                              dataStr === hojeStr ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">Não Iniciado</span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-400">Sem Histórico</span>
                              )
                            ) : inv.status === "EM_ANDAMENTO" || inv.status === "ABERTO" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">Em Andamento</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">Concluído</span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 text-center font-medium text-slate-700">{u.no_patio}</td>
                          
                          {inv ? (
                            <>
                              <td className="px-6 py-4 text-center font-medium text-slate-700">{inv.bipados}</td>
                              <td className="px-6 py-4 text-center font-medium text-emerald-600">{inv.corretos}</td>
                              <td className="px-6 py-4 text-center font-medium text-orange-600">{inv.divergentes}</td>
                              <td className="px-6 py-4 text-center font-medium text-red-600">{inv.extravios}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-center text-slate-400">-</td>
                              <td className="px-6 py-4 text-center text-slate-400">-</td>
                              <td className="px-6 py-4 text-center text-slate-400">-</td>
                              <td className="px-6 py-4 text-center text-slate-400">-</td>
                            </>
                          )}
                          
                          <td className="px-6 py-4 text-right">
                            {inv ? (
                              <Link href={inv.status === "ABERTO" ? `/inventario/${inv.id}` : `/inventario/${inv.id}/relatorio`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                Abrir ↗
                              </Link>
                            ) : dataStr === hojeStr ? (
                              <button onClick={() => setModalUnidade(u)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Iniciar +
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">N/D</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
