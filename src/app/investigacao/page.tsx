"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import Image from "next/image";

// ─── Ícones SVG Modernos ─────────────────────────────────────────────────────
const IconSearch = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconAlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconCheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClock = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconTruck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const IconBox = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconCopy = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconClipboardList = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

// ─── Tipagens Fortes para Investigação ──────────────────────────────────────
interface HistoricoMovimentacaoBrudam {
  id: number;
  barra: string;
  data: Date | string;
  tipo: number;
  manifesto: number | null;
  picking_unidade: number | null;
  unidade_nome: string | null;
  unidade_sigla: string | null;
  manifesto_base: number | null;
  manifesto_status: number | null;
  placa: string | null;
}

interface HistoricoInventarioTorre {
  id: string;
  codigo_barra: string;
  inventario_id: string;
  unidade_id: number;
  unidade_nome: string;
  unidade_sigla: string | null;
  praca: string | null;
  status_auditoria: string;
  inventario_status: string;
  data_leitura: Date | string;
}

interface VolumeDetalheModal {
  barra: string;
  parcial: number | null;
  id_volume: number | null;
  localizacaoAtual: string;
  statusOperacional: string;
  ultimaData: Date | string | null;
  historicoBrudam: HistoricoMovimentacaoBrudam[];
  historicoInventario: HistoricoInventarioTorre[];
}

function InvestigacaoContent() {
  const searchParams = useSearchParams();
  const paramMinuta = searchParams.get("minuta") ?? searchParams.get("termo") ?? "";

  const [termoBusca, setTermoBusca] = useState(paramMinuta);
  const [termoAtivo, setTermoAtivo] = useState(paramMinuta);
  const [minutaSelecionadaId, setMinutaSelecionadaId] = useState<number | null>(null);
  const [volumeModal, setVolumeModal] = useState<VolumeDetalheModal | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [, startTransition] = useTransition();

  // Se a URL mudar ou for carregada com parâmetro
  useEffect(() => {
    if (paramMinuta && paramMinuta !== termoAtivo) {
      setTermoBusca(paramMinuta);
      setTermoAtivo(paramMinuta);
      setMinutaSelecionadaId(null);
    }
  }, [paramMinuta, termoAtivo]);

  // 1. Busca por candidatos
  const { data: resultadosBusca, isFetching: buscando, error: erroBusca } = api.investigacao.buscarMinuta.useQuery(
    { termo: termoAtivo },
    {
      enabled: termoAtivo.length >= 2,
      staleTime: 60 * 1000,
    }
  );

  // Auto-selecionar caso haja apenas 1 resultado exato
  useEffect(() => {
    if (resultadosBusca?.length === 1 && resultadosBusca[0]) {
      setMinutaSelecionadaId(resultadosBusca[0].id_minuta);
    }
  }, [resultadosBusca]);

  // 2. Detalhes completos da minuta selecionada
  const { data: detalhes, isLoading: carregandoDetalhes, error: erroDetalhes } = api.investigacao.obterDetalhesInvestigacao.useQuery(
    { idMinuta: minutaSelecionadaId! },
    {
      enabled: !!minutaSelecionadaId,
      staleTime: 30 * 1000,
    }
  );

  const handleBuscar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = termoBusca.trim();
    if (clean.length < 2) return;
    startTransition(() => {
      setTermoAtivo(clean);
      setMinutaSelecionadaId(null);
    });
  };

  const copiarResumoInvestigacao = () => {
    if (!detalhes) return;
    const m = detalhes.minuta;
    const texto = [
      `*INVESTIGAÇÃO DE MINUTA / EXTRAVIO - TORRE DE INVENTÁRIO*`,
      `Minuta: ${m.id_minuta} | CTe: ${m.cte_numero ?? "N/D"}`,
      `Origem: ${m.origem_nome} -> Destino: ${m.destino_nome}`,
      `Total de Volumes: ${m.total_volumes}`,
      `----------------------------------------`,
      `*DIAGNÓSTICO OPERACIONAL:*`,
      ...detalhes.alertas.map((a) => `- [${a.tipo.toUpperCase()}] ${a.titulo}: ${a.mensagem}`),
      `----------------------------------------`,
      `*DISTRIBUIÇÃO DOS VOLUMES:*`,
      ...detalhes.gruposLocais.map(
        (g) => `- ${g.qtd} volume(s) em: ${g.local} (Volumes: ${g.volumes.map((v) => v.parcial ? `#${v.parcial}` : v.barra.slice(-4)).join(", ")})`
      ),
      `----------------------------------------`,
      `*ÚLTIMAS OCORRÊNCIAS:*`,
      detalhes.ocorrencias.length > 0
        ? detalhes.ocorrencias.map((o) => `- ${o.data_evento ? new Date(o.data_evento).toLocaleDateString("pt-BR") : ""}: ${o.descricao}`).join("\n")
        : "- Nenhuma ocorrência de sinistro registrada",
    ].join("\n");

    void navigator.clipboard.writeText(texto).catch((err: unknown) => {
      console.error("Erro ao copiar resumo:", err);
    });
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* ─── Header & Navegação ────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Image src="/cropped-icon.png" alt="Princesa dos Campos" width={42} height={42} className="h-10 w-10" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-green-700 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Dashboard Principal
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-green-700">Setor Solução</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-950 flex items-center gap-3">
                Investigação de Minutas & Extravios
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Rastreie a última bipagem física de cada volume e audite leituras em relatórios de inventário.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/historico"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm rounded-lg shadow-sm border border-slate-200 transition-all"
            >
              <IconClipboardList className="w-4 h-4 text-slate-500" />
              Histórico Inventários
            </Link>
          </div>
        </header>

        {/* ─── Barra de Busca Proeminente ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <IconSearch className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Digite o número da Minuta (ex: 1608314), CTe (ex: 6290) ou Código de Barras (17 dígitos)..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={buscando || termoBusca.trim().length < 2}
              className="px-6 py-3.5 bg-green-800 hover:bg-green-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              {buscando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <IconSearch className="w-4 h-4" />
                  Investigar Carga
                </>
              )}
            </button>
          </form>

          {/* Exemplos rápidos para facilitar o uso */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-500">Exemplos para testar:</span>
            <button
              type="button"
              onClick={() => { setTermoBusca("1608314"); setTermoAtivo("1608314"); setMinutaSelecionadaId(null); }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-600 transition-colors font-mono"
            >
              Minuta 1608314 (7 volumes)
            </button>
            <button
              type="button"
              onClick={() => { setTermoBusca("85660154628506254"); setTermoAtivo("85660154628506254"); setMinutaSelecionadaId(null); }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-600 transition-colors font-mono"
            >
              Barra 85660154628506254
            </button>
          </div>
        </div>

        {/* ─── Lista de Resultados Encontrados (se múltiplos) ────────────── */}
        {resultadosBusca && resultadosBusca.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Selecione a Minuta Desejada ({resultadosBusca.length} encontradas):
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {resultadosBusca.map((r) => (
                <button
                  key={r.id_minuta}
                  onClick={() => setMinutaSelecionadaId(r.id_minuta)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 ${
                    minutaSelecionadaId === r.id_minuta
                      ? "border-green-600 bg-green-50/50 shadow-sm ring-1 ring-green-600"
                      : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minuta</span>
                      <p className="text-lg font-black text-slate-900 leading-tight">#{r.id_minuta}</p>
                    </div>
                    {r.cte_numero && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-200/80 text-slate-700">
                        CTe: {r.cte_numero}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>{r.origem_nome}</span>
                      <span className="text-slate-400">→</span>
                      <span>{r.destino_nome}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                      <span><strong>{r.total_volumes ?? 0}</strong> volumes</span>
                      {r.prev_entrega && (
                        <span>Prev: {new Date(r.prev_entrega).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Sem resultados ────────────────────────────────────────────── */}
        {resultadosBusca?.length === 0 && !buscando && Boolean(termoAtivo) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <IconAlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhuma minuta localizada</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Não encontramos nenhuma minuta, CTE ou volume com o termo <span className="font-mono font-bold text-slate-800">&quot;{termoAtivo}&quot;</span>.
              Verifique os dígitos e tente novamente.
            </p>
          </div>
        )}

        {/* ─── Mensagem de Erro na Consulta ──────────────────────────────── */}
        {Boolean(erroBusca ?? erroDetalhes) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-900 space-y-2">
            <div className="flex items-center gap-3">
              <IconAlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-base">Falha ao carregar dados da investigação</h3>
            </div>
            <p className="text-xs text-red-700">
              {erroDetalhes?.message ?? erroBusca?.message ?? "Ocorreu um erro ao consultar os dados no servidor. Verifique o número digitado e tente novamente."}
            </p>
          </div>
        )}

        {/* ─── Loading Detalhes ──────────────────────────────────────────── */}
        {carregandoDetalhes && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-green-800/20 border-t-green-800 rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Cruzando dados operacionais...</h3>
            <p className="text-xs text-slate-400">
              Consultando histórico de carregamento, manifestos da Brudam e leituras dos inventários da Torre.
            </p>
          </div>
        )}

        {/* ─── PAINEL DE INVESTIGAÇÃO COMPLETO ──────────────────────────── */}
        {detalhes && !carregandoDetalhes && (
          <div className="space-y-6">

            {/* 1. Diagnóstico Inteligente & Alertas em Destaque */}
            {detalhes.alertas.length > 0 && (
              <div className="space-y-3">
                {detalhes.alertas.map((alerta, idx) => {
                  const cores = {
                    danger: "bg-red-50 border-red-200 text-red-900",
                    warning: "bg-amber-50 border-amber-200 text-amber-900",
                    info: "bg-blue-50 border-blue-200 text-blue-900",
                    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
                  }[alerta.tipo];

                  const icones = {
                    danger: <IconAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />,
                    warning: <IconAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />,
                    info: <IconCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />,
                    success: <IconCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />,
                  }[alerta.tipo];

                  return (
                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${cores}`}>
                      {icones}
                      <div className="flex-1">
                        <h4 className="text-sm font-bold tracking-tight">{alerta.titulo}</h4>
                        <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{alerta.mensagem}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Cabeçalho da Minuta & Informações Gerais */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-800 flex items-center justify-center font-black text-xl shadow-inner">
                    <IconBox className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Minuta</span>
                      <h2 className="text-2xl font-black text-slate-900">#{detalhes.minuta.id_minuta}</h2>
                      {detalhes.minuta.cte_numero && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          CTe {detalhes.minuta.cte_numero}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 font-medium mt-1 flex items-center gap-2">
                      <span className="font-bold text-slate-900">{detalhes.minuta.origem_nome}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="font-bold text-slate-900">{detalhes.minuta.destino_nome}</span>
                      {detalhes.minuta.rota_nome && (
                        <span className="text-xs text-slate-400">({detalhes.minuta.rota_nome})</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={copiarResumoInvestigacao}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors shadow-sm"
                    title="Copiar relatório formatado para chamado do Solução"
                  >
                    {copiado ? <IconCheck className="w-4 h-4 text-green-700" /> : <IconCopy className="w-4 h-4 text-slate-600" />}
                    {copiado ? "Copiado com Sucesso!" : "Copiar Resumo p/ Chamado"}
                  </button>
                </div>
              </div>

              {/* KPIs Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volumes Totais</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{detalhes.minuta.total_volumes}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{detalhes.volumes.length} com barra cadastrada</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Locais Distintos</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{detalhes.gruposLocais.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {detalhes.gruposLocais.length > 1 ? "⚠️ Volumes espalhados" : "Todos agrupados"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leituras em Inventários</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{detalhes.inventarios.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Auditados no pátio</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ocorrências / Sinistros</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{detalhes.ocorrencias.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Registros em frete_hist</p>
                </div>
              </div>

              {/* Resumo da Dispersão dos Volumes */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <IconTruck className="w-4 h-4 text-green-400" />
                    Onde cada volume está agora (Última Posição Conhecida):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {detalhes.gruposLocais.map((g, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-800 border border-slate-700 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-green-400">{g.qtd} volume(s)</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          g.tipo === "DESEMBARCADO" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                          g.tipo === "EMBARCADO" ? "bg-blue-950 text-blue-300 border border-blue-800" :
                          "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}>
                          {g.tipo}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate" title={g.local}>
                        {g.local}
                      </p>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-1 mt-1">
                        Volumes: {g.volumes.map((v) => (
                          <span key={v.barra} className="px-1.5 py-0.2 bg-slate-700/80 rounded font-mono text-[10px] text-slate-300">
                            {v.parcial ? `#${v.parcial}` : v.barra.slice(-4)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Tabela Detalhada de Volumes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconBox className="w-5 h-5 text-green-700" />
                    Rastreamento Individual de Cada Volume
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clique em um volume para abrir o histórico completo de carregamentos e descarregamentos.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                  Total: {detalhes.volumes.length} volume(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                      <th className="px-4 py-3">Vol.</th>
                      <th className="px-4 py-3">Código de Barras</th>
                      <th className="px-4 py-3">Última Bipagem Física (Brudam)</th>
                      <th className="px-4 py-3">Manifesto / Placa</th>
                      <th className="px-4 py-3">Data / Hora Bipagem</th>
                      <th className="px-4 py-3">Status Inventário Torre</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {detalhes.volumes.map((v) => {
                      const ultimaMov = v.ultimaMovBrudam;
                      const ultimoInv = v.ultimoInventario;

                      return (
                        <tr key={v.barra} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-900 font-black text-xs">
                              {v.parcial ?? "?"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-slate-800 font-bold">{v.barra}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            {ultimaMov ? (
                              <div className="space-y-0.5">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                                  ultimaMov.tipo === 2
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {ultimaMov.tipo === 2 ? "DESEMBARQUE" : "EMBARQUE"}
                                </span>
                                <p className="font-bold text-slate-800 text-xs">{ultimaMov.unidade_nome}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Nenhuma bipagem Brudam</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {ultimaMov?.manifesto ? (
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800">Manif. #{ultimaMov.manifesto}</p>
                                {ultimaMov.placa && (
                                  <p className="text-[10px] text-slate-500 font-mono">Placa: {ultimaMov.placa}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {ultimaMov?.data ? (
                              <div className="flex items-center gap-1.5">
                                <IconClock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{new Date(ultimaMov.data).toLocaleString("pt-BR")}</span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {ultimoInv ? (
                              <div className="space-y-0.5">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                                  ultimoInv.status_auditoria === "ENCONTRADO_CORRETO" ? "bg-emerald-100 text-emerald-800" :
                                  ultimoInv.status_auditoria === "SOBRA_NA_BASE" ? "bg-amber-100 text-amber-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {ultimoInv.status_auditoria}
                                </span>
                                <p className="text-[11px] text-slate-600 font-medium">
                                  {ultimoInv.unidade_nome} {ultimoInv.praca ? `(${ultimoInv.praca})` : ""}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Não bipado em inventário</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setVolumeModal(v)}
                              className="px-3 py-1.5 bg-white hover:bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                            >
                              Ver Histórico
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Ocorrências da Minuta (se houver) */}
            {detalhes.ocorrencias.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconAlertTriangle className="w-5 h-5 text-amber-600" />
                  Ocorrências Registradas na Minuta (frete_hist)
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {detalhes.ocorrencias.map((oco) => (
                    <div key={oco.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800">{oco.descricao}</span>
                        {oco.id_oco && (
                          <span className="text-[10px] text-slate-400 block">Código Oco: #{oco.id_oco}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <IconClock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{oco.data_evento ? new Date(oco.data_evento).toLocaleString("pt-BR") : "Data não informada"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Inventários Auditados na Torre */}
            {detalhes.inventarios.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconClipboardList className="w-5 h-5 text-green-700" />
                  Auditorias Físicas Realizadas pela Torre de Inventário
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {detalhes.inventarios.map((inv) => (
                    <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{inv.unidade_nome}</span>
                          {inv.praca && (
                            <span className="text-xs text-slate-500">Praça: {inv.praca}</span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            inv.status_auditoria === "ENCONTRADO_CORRETO" ? "bg-emerald-100 text-emerald-800" :
                            inv.status_auditoria === "SOBRA_NA_BASE" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {inv.status_auditoria}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Código Bipado: {inv.codigo_barra}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <IconClock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(inv.data_leitura).toLocaleString("pt-BR")}
                        </span>
                        <Link
                          href={`/inventario/${inv.inventario_id}/relatorio`}
                          className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg text-xs font-semibold border border-green-200 transition-colors"
                        >
                          Ver Relatório do Inventário ➔
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ─── Modal com a Linha do Tempo do Volume ────────────────────── */}
      {volumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-green-100 text-green-900 font-black text-base flex items-center justify-center">
                  {volumeModal.parcial ?? "?"}
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Histórico do Volume #{volumeModal.parcial ?? "N/D"}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {volumeModal.barra}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVolumeModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Linha do Tempo de Bipagens Brudam ({volumeModal.historicoBrudam?.length ?? 0} registros):
              </h4>

              {volumeModal.historicoBrudam?.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {volumeModal.historicoBrudam.map((mov: HistoricoMovimentacaoBrudam, idx: number) => (
                    <div key={idx} className="relative space-y-1">
                      <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        mov.tipo === 2 ? "bg-emerald-500" : "bg-blue-500"
                      }`} />
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          mov.tipo === 2 ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {mov.tipo === 2 ? "DESEMBARQUE" : "EMBARQUE"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(mov.data).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{mov.unidade_nome}</p>
                      {mov.manifesto && (
                        <p className="text-xs text-slate-500">
                          Manifesto: <strong>#{mov.manifesto}</strong>
                          {mov.placa && ` • Placa: ${mov.placa}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhuma bipagem de carregamento/descarregamento registrada na Brudam para este volume.</p>
              )}

              {volumeModal.historicoInventario?.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bipado em Inventários da Torre:
                  </h4>
                  {volumeModal.historicoInventario.map((inv: HistoricoInventarioTorre, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{inv.unidade_nome}</span>
                        <span className="text-slate-400">{new Date(inv.data_leitura).toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-slate-600">
                        Status da auditoria: <strong>{inv.status_auditoria}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setVolumeModal(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function InvestigacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-800/20 border-t-green-800 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Carregando tela de investigação...</p>
          </div>
        </div>
      }
    >
      <InvestigacaoContent />
    </Suspense>
  );
}
