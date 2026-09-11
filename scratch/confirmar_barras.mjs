import postgres from "postgres";

const sql = postgres({
  host: "172.20.10.205",
  port: 5432,
  database: "torre_controle",
  username: "torre_vw",
  password: "!Epc#Torre2@",
  max: 1,
  connect_timeout: 10,
});

async function main() {
  // 1. Confirmar que a coluna 'barras' existe e ver o formato
  const amostra = await sql`
    SELECT id_volume, id_minuta, barra, barras, parcial, total
    FROM volumes
    WHERE barras IS NOT NULL AND barras != ''
    LIMIT 15
  `;
  console.log("Amostra volumes.barras:");
  for (const r of amostra) console.log(JSON.stringify(r));

  // 2. Comprimento da coluna barras
  const comp = await sql`
    SELECT LENGTH(barras) as len, COUNT(*) as qtd
    FROM volumes
    WHERE barras IS NOT NULL AND barras != ''
    GROUP BY len ORDER BY qtd DESC LIMIT 5
  `;
  console.log("\nComprimentos de volumes.barras:", JSON.stringify(comp));

  // 3. Cruzar: barras da coluna volumes.barras com historico_volume.barra
  // (devem ser iguais para os volumes que têm bipagem)
  const cruzado = await sql`
    SELECT h.barra AS h_barra, v.barras AS v_barras,
           (h.barra = v.barras) AS sao_iguais,
           v.id_minuta, v.parcial
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE v.barras IS NOT NULL
    LIMIT 10
  `;
  console.log("\nCruzamento historico_volume.barra X volumes.barras:");
  for (const r of cruzado) console.log(JSON.stringify(r));

  // 4. Verificar se a barra da etiqueta na bipagem coincide com volumes.barras
  const validacao = await sql`
    SELECT
      COUNT(*) FILTER (WHERE h.barra = v.barras) AS match,
      COUNT(*) AS total
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE v.barras IS NOT NULL AND h.barra IS NOT NULL
    LIMIT 1
  `;
  console.log("\nValidação match historico X volumes.barras:", JSON.stringify(validacao[0]));

  // 5. Volumes com barras preenchido mas sem historico_volume (os 'novos' que agora conseguimos achar)
  const novosVols = await sql`
    SELECT COUNT(*) AS total
    FROM volumes v
    WHERE v.barras IS NOT NULL AND v.barras != ''
      AND NOT EXISTS (SELECT 1 FROM historico_volume h WHERE h.id_volume = v.id_volume)
  `;
  console.log("\nVolumes com barras mas SEM historico_volume:", JSON.stringify(novosVols[0]));

  await sql.end();
}

main().catch(console.error);
