"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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

export default function UnidadePage() {
  const params = useParams();
  const router = useRouter();
  const unidadeId = typeof params.id === "string" ? parseInt(params.id, 10) : 0;

  const { data: nomeUnidade, isLoading: loadingNome } = api.inventory.buscarNomeUnidade.useQuery(
    { unidade_id: unidadeId },
    { enabled: !!unidadeId }
  );

  const { data: pracas, isLoading: loadingPracas } = api.inventory.obterStatusPracasDia.useQuery(
    { unidade_id: unidadeId },
    { enabled: !!unidadeId }
  );

  const criarMutation = api.inventory.criarInventario.useMutation({
    onSuccess: (data) => router.push(`/inventario/${data.id}`),
  });

  const [iniciandoPraca, setIniciandoPraca] = useState<string | null>(null);

  const handleIniciarInventario = (pracaId: string, pracaLabel: string) => {
    if (criarMutation.isPending) return;
    setIniciandoPraca(pracaId);
    criarMutation.mutate({ 
      unidade_id: unidadeId,
      praca: pracaId,
      praca_label: pracaLabel
    });
  };

  const pracasConcluidas = pracas?.filter(p => p.inventario?.status === "CONCLUIDO").length ?? 0;
  const pracasTotal = pracas?.length ?? 0;
  const todasConcluidas = pracasTotal > 0 && pracasConcluidas === pracasTotal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
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
                Gestão de Praças
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-green-900">
              {loadingNome ? "Carregando..." : (nomeUnidade ? nomeUnidade.fantasia : `Unidade ${unidadeId}`)}
            </h1>
            {nomeUnidade && (
              <p className="text-sm font-mono text-slate-400 mt-0.5">{nomeUnidade.sigla} · ID {unidadeId}</p>
            )}
          </div>
          
          {todasConcluidas && (
            <div className="flex gap-3">
              <button
                className="inline-flex items-center justify-center px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl transition-colors border border-emerald-200 shadow-sm"
              >
                Gerar Relatório Completo do Dia
              </button>
            </div>
          )}
        </header>

        {/* Lista de Praças */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Praças do Galpão</h2>
          <p className="text-sm text-slate-500">Selecione uma praça para iniciar a conferência</p>
          
          {loadingPracas ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[200px] bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : pracas?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
              Nenhum volume ativo nesta unidade.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pracas?.map((praca) => {
                const isSemPraca = praca.praca === 'SEM_PRACA';
                
                return (
                  <div 
                    key={praca.praca} 
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-green-400 hover:shadow-lg hover:shadow-green-50 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">
                            {isSemPraca ? 'N/A' : 'PRAÇA'}
                          </p>
                          <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-green-800 transition-colors">
                            {praca.praca_label}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 bg-slate-50 text-slate-700 rounded-xl px-3 py-1.5 text-center min-w-[52px]">
                          <p className="text-xl font-black leading-none">{praca.no_patio}</p>
                          <p className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">esperado</p>
                        </div>
                      </div>

                      <div className="mb-6 flex-1 flex flex-col justify-end">
                        {!praca.inventario ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500 w-fit">
                             Não Iniciado
                           </span>
                        ) : praca.inventario.status === "ABERTO" ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 w-fit">
                             Em Andamento
                           </span>
                        ) : (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 w-fit">
                             Concluído
                           </span>
                        )}
                      </div>

                      {praca.inventario ? (
                        <Link
                          href={praca.inventario.status === "ABERTO" ? `/inventario/${praca.inventario.id}` : `/inventario/${praca.inventario.id}/relatorio`}
                          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {praca.inventario.status === "ABERTO" ? "Continuar" : "Ver Relatório"}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleIniciarInventario(praca.praca, praca.praca_label)}
                          disabled={criarMutation.isPending}
                          className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {iniciandoPraca === praca.praca ? (
                             <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                          ) : (
                             <IconPlus />
                          )}
                          Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
