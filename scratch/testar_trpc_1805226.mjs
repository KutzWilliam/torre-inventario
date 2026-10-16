async function testar() {
  const input = JSON.stringify({ "json": { "idMinuta": 1805226 } });
  const url = `http://localhost:3008/api/trpc/investigacao.obterDetalhesInvestigacao?input=${encodeURIComponent(input)}`;
  console.log("Chamando com minuta 1805226:", url);
  const resp = await fetch(url);
  console.log("Status:", resp.status);
  const data = await resp.json();
  console.log("Resultado:", JSON.stringify(data.result?.data?.json?.minuta, null, 2));
  console.log("Alertas:", JSON.stringify(data.result?.data?.json?.alertas, null, 2));
  console.log("Volumes:", JSON.stringify(data.result?.data?.json?.volumes?.map(v => ({
    parcial: v.parcial,
    barra: v.barra,
    local: v.localizacaoAtual,
    statusOperacional: v.statusOperacional,
  })), null, 2));
}

testar().catch(console.error);
