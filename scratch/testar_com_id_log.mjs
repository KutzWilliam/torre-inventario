import postgres from "postgres";

const dbReadonly = postgres({
  host: process.env.READONLY_DB_HOST || "172.20.10.205",
  port: Number(process.env.READONLY_DB_PORT) || 5432,
  database: process.env.READONLY_DB_NAME || "torre_controle",
  username: process.env.READONLY_DB_USER || "torre_vw",
  password: process.env.READONLY_DB_PASSWORD || "!Epc#Torre2@",
  max: 2,
  connect_timeout: 10,
});

async function main() {
  const idMinuta = 1808947;
  console.log("=== TESTANDO COM id_log ===");

  const ocorrencias = await dbReadonly`
    SELECT 
      f.id_log,
      f.frete AS id_minuta,
      f.status AS id_oco,
      t.descricao AS descricao,
      f.created_at AS data_evento
    FROM frete_hist f
    LEFT JOIN tipo_oco t ON t.id_oco = f.status
    WHERE f.frete = ${idMinuta}
    ORDER BY f.created_at DESC, f.id_log DESC
  `;
  console.log("ocorrencias com sucesso:", ocorrencias);

  const volumesCadastrados = await dbReadonly`
    SELECT 
      v.id_volume,
      v.barras,
      v.parcial
    FROM volumes v
    WHERE v.id_minuta = ${idMinuta}
    ORDER BY v.parcial ASC NULLS LAST, v.id_volume ASC
  `;
  console.log("volumesCadastrados:", volumesCadastrados);

  const listaBarras = volumesCadastrados.map(v => String(v.barras));

  const histRows = await dbReadonly`
    SELECT 
      h.id,
      h.barra,
      h.data,
      h.tipo AS h_tipo,
      h.manifesto,
      p.unidade AS picking_unidade,
      u.fantasia AS unidade_nome,
      u.sigla AS unidade_sigla,
      man.base AS manifesto_base,
      man.status AS manifesto_status,
      vec.placa AS veiculo_placa
    FROM historico_volume h
    LEFT JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
    LEFT JOIN unidades u ON p.unidade = u.id_unidade
    LEFT JOIN manifesto man ON h.manifesto = man.id_manifesto
    LEFT JOIN veiculos vec ON (man.veiculo = vec.id_veiculo OR man.veiculo_terceiro = vec.id_veiculo)
    WHERE h.barra = ANY(${listaBarras})
    ORDER BY h.data ASC, h.id ASC
  `;
  console.log("histRows encontrados:", histRows.length);
  console.log("amostra histRows:", histRows);

  await dbReadonly.end();
}

main().catch(err => {
  console.error("ERRO:", err);
  process.exit(1);
});
