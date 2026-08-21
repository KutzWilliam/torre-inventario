"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────


function StatusBadge({ status, cteZero }: { status: string; cteZero?: boolean }) {
  if (cteZero) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200/60 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        CTE = 0
      </span>
    );
  }
  if (status === "CARREGANDO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60 whitespace-nowrap">
        <svg className="animate-spin w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando...
      </span>
    );
  }
  if (status === "ENCONTRADO_CORRETO") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Correto
      </span>
    );
  }
  if (status === "POSSIVEL_EXTRAVIO") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200/60 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Extravio?
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200/60 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Sobra
    </span>
  );
}

// ─── Tipo do item bipado (simples, sem consulta legado) ────────────────────
type ItemSimples = {
  id: string;
  inventario_id: string;
  codigo_barra: string;
  status_auditoria: string;
  criadoEm: Date;
};

// ─── Linha da tabela (simples — sem consulta legado) ──────────────────────
function ItemRow({ item, isNew, onRemover }: { item: ItemSimples; isNew?: boolean; onRemover: (id: string) => void }) {
  const isExtravio = item.status_auditoria === "POSSIVEL_EXTRAVIO";

  return (
    <tr
      className={[
        "border-b border-slate-100 transition-all duration-300",
        isNew ? "bg-indigo-50/70" : isExtravio ? "bg-purple-50/40" : "hover:bg-slate-50/60",
      ].join(" ")}
    >
      {/* Código de Barras */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              isExtravio ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-slate-800 leading-none">
              {item.codigo_barra}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {new Date(item.criadoEm).toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit", second: "2-digit",
              })}
            </p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={item.status_auditoria} />
      </td>

      {/* Remover */}
      <td className="px-4 py-3">
        <button
          onClick={() => onRemover(item.id)}
          title="Remover volume"
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function InventarioPage() {
  const params = useParams();
  const router = useRouter();
  const inventarioId = typeof params.id === "string" ? params.id : "";

  const [codigo, setCodigo] = useState("");
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [duplicado, setDuplicado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const duplicadoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer para auto-submit após pausa do leitor de código de barras
  const scannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Queries e Mutations do tRPC
  const trpcUtils = api.useUtils();
  const { data: itens, isLoading } = api.inventory.listarItensDoInventario.useQuery(
    { inventarioId },
    { enabled: !!inventarioId }
  );

  // Busca o inventário para descobrir o unidade_id → nome da unidade
  const { data: inventarios } = api.inventory.listarInventarios.useQuery(undefined, {
    staleTime: 60 * 1000,
  });
  const inventarioAtual = inventarios?.find((inv) => inv.id === inventarioId);
  const unidadeId = inventarioAtual?.unidade_id;

  const { data: nomeUnidade } = api.inventory.buscarNomeUnidade.useQuery(
    { unidade_id: unidadeId! },
    { enabled: !!unidadeId }
  );

  const fecharMutation = api.inventory.fecharInventario.useMutation({
    onSuccess: () => {
      router.push(`/inventario/${inventarioId}/relatorio`);
    },
    onError: (err) => {
      alert(`Erro ao fechar inventário: ${err.message}`);
    },
  });

  const removerMutation = api.inventory.removerItem.useMutation({
    onSuccess: () => {
      void trpcUtils.inventory.listarItensDoInventario.invalidate({ inventarioId });
    },
    onError: (err) => {
      alert(`Erro ao remover item: ${err.message}`);
    },
  });

  const handleRemover = (itemId: string) => {
    if (!confirm("Remover este volume do inventário?")) return;
    removerMutation.mutate({ itemId, inventarioId });
  };

  const mutation = api.inventory.processarBipagemDiaria.useMutation({
    onMutate: async (novoItem) => {
      // Optimistic update
      await trpcUtils.inventory.listarItensDoInventario.cancel({ inventarioId });
      const previousItens = trpcUtils.inventory.listarItensDoInventario.getData({ inventarioId });
      
      if (previousItens) {
        trpcUtils.inventory.listarItensDoInventario.setData({ inventarioId }, [
          {
            id: `temp-${Date.now()}`,
            inventario_id: inventarioId,
            codigo_barra: novoItem.codigoBarra,
            status_auditoria: "CARREGANDO", // status temporário provisório
            criadoEm: new Date(),
          },
          ...previousItens,
        ]);
      }
      return { previousItens };
    },
    onSuccess: (data) => {
      void trpcUtils.inventory.listarItensDoInventario.invalidate({ inventarioId });
      
      if (data.duplicado) {
        // Exibe aviso visual de duplicata por 3 segundos
        setDuplicado(true);
        if (duplicadoTimerRef.current) clearTimeout(duplicadoTimerRef.current);
        duplicadoTimerRef.current = setTimeout(() => setDuplicado(false), 3000);
        return;
      }

      // Novo item — atualiza lista e destaca o item bipado
      setLastScannedId(data.item.id);
      setDuplicado(false);
    },
    onError: (err, newItem, context) => {
      // Reverte se der erro
      if (context?.previousItens) {
        trpcUtils.inventory.listarItensDoInventario.setData({ inventarioId }, context.previousItens);
      }
      inputRef.current?.focus();
    },
  });

  // Mantém o foco no input sempre que possível
  useEffect(() => {
    inputRef.current?.focus();
    const handleClick = () => inputRef.current?.focus();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Re-foca o input sempre que a lista de itens for atualizada (após invalidate)
  useEffect(() => {
    inputRef.current?.focus();
  }, [itens]);

  const submitCodigo = (value: string) => {
    if (!value.trim()) return;
    mutation.mutate({ inventarioId, codigoBarra: value.trim() });
    setCodigo(""); // Limpa imediatamente, não espera o backend
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Cancela o debounce se o usuário aperta Enter manualmente
    if (scannerTimerRef.current) clearTimeout(scannerTimerRef.current);
    submitCodigo(codigo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCodigo(value);

    // Auto-submit: aguarda 220ms de silêncio após o último caractere
    // (leitores de código de barras enviam todos os chars em <100ms)
    if (scannerTimerRef.current) clearTimeout(scannerTimerRef.current);
    if (value.trim()) {
      scannerTimerRef.current = setTimeout(() => {
        submitCodigo(value);
      }, 220);
    }
  };

  // ─── Contadores (simples, só por status) ───────────────────────────────────
  const todosItens    = (itens ?? []) as ItemSimples[];
  const itensCorretos = todosItens.filter((i) => i.status_auditoria === "ENCONTRADO_CORRETO");
  const itensSobra    = todosItens.filter((i) => i.status_auditoria === "SOBRA_NA_BASE");
  const itensExtravio = todosItens.filter((i) => i.status_auditoria === "POSSIVEL_EXTRAVIO");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Cabeçalho ── */}
        <header className="flex items-start justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Painel de Unidades
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Bipagem Contínua
            </h1>
            {nomeUnidade ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg text-sm font-semibold">
                  🏢 {nomeUnidade.fantasia}
                </span>
                <span className="text-slate-400 text-xs font-mono">{nomeUnidade.sigla}</span>
              </div>
            ) : (
              <p className="text-slate-500 mt-1 text-sm">
                Inventário:{" "}
                <span className="font-mono bg-slate-200 px-2 py-0.5 rounded">{inventarioId}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-600">Leitor Ativo</span>
          </div>
        </header>

        {/* ── Contadores resumo ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Bipado", value: todosItens.length, color: "indigo", desc: "neste inventário" },
            { label: "Corretos", value: itensCorretos.length, color: "emerald", desc: "no local certo" },
            { label: "Sobras", value: itensSobra.length, color: "amber", desc: "não esperados" },
            { label: "Extravios?", value: itensExtravio.length, color: "purple", desc: "minuta finalizada" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-sm"
            >
              <p className="text-2xl font-black text-slate-800">{item.value}</p>
              <p className="text-xs font-semibold text-slate-600">{item.label}</p>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Input de bipagem ── */}
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={handleChange}
            placeholder="Aguardando código de barras..."
            className={[
              "block w-full pl-14 pr-4 py-5 text-xl font-mono text-slate-900 bg-white border-2 rounded-2xl focus:ring-0 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-sans",
              duplicado
                ? "border-red-400 animate-pulse focus:border-red-400"
                : "border-slate-200 focus:border-indigo-500",
            ].join(" ")}
            autoFocus
            autoComplete="off"
          />
          <button type="submit" className="sr-only">Bipar</button>
        </form>

        {/* ── Banner de duplicata ── */}
        <div
          className={[
            "flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300",
            duplicado
              ? "opacity-100 bg-red-50 border-red-200 text-red-700"
              : "opacity-0 pointer-events-none bg-transparent border-transparent",
          ].join(" ")}
          aria-live="polite"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-semibold text-sm">Código já bipado neste inventário</p>
            <p className="text-xs text-red-600/80">Volume desconsiderado — use cada código apenas uma vez.</p>
          </div>
        </div>

        {/* ── Tabela de itens ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700">Volumes bipados neste inventário</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                {todosItens.length} volume{todosItens.length !== 1 ? "s" : ""}
              </span>
              {itensExtravio.length > 0 && (
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
                  {itensExtravio.length} extravios?
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Carregando histórico...</div>
            ) : !itens?.length ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Nenhum item bipado neste inventário ainda.</p>
                <p className="text-sm mt-1">Comece a usar o leitor acima.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                  <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 font-semibold">Código de Barras</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {todosItens.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      isNew={item.id === lastScannedId}
                      onRemover={handleRemover}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Botão Finalizar ── */}
        <div className="flex justify-end pb-8">
          <button
            onClick={() => fecharMutation.mutate({ inventarioId })}
            disabled={fecharMutation.isPending || isLoading}
            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {fecharMutation.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando Reconciliação...
              </>
            ) : (
              <>
                Finalizar Inventário
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
