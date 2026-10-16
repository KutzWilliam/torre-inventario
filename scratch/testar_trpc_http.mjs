async function testar() {
  const url = `http://localhost:3008/api/trpc/investigacao.obterDetalhesInvestigacao?input=${encodeURIComponent(JSON.stringify({ idMinuta: 1808947 }))}`;
  console.log("Chamando:", url);
  const resp = await fetch(url);
  console.log("Status:", resp.status);
  const data = await resp.json();
  console.log("Resultado resumo:", {
    minuta: data.result?.data?.minuta,
    totalAlertas: data.result?.data?.alertas?.length,
    alertas: data.result?.data?.alertas,
    totalVolumes: data.result?.data?.volumes?.length,
    volumes: data.result?.data?.volumes?.map(v => ({
      parcial: v.parcial,
      barra: v.barra,
      local: v.localizacaoAtual,
      statusOperacional: v.statusOperacional,
      manifesto: v.ultimaMovBrudam?.manifesto,
    }))
  });
}

testar().catch(console.error);
