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
  console.log("=== ANÁLISE DE BARRAS DE 17 DÍGITOS NO HISTORICO_VOLUME E PRE_MINUTA ===");
  
  // Amostra de barras de 17 dígitos no historico_volume
  const amostrasHV = await sql`
    SELECT h.barra, v.id_minuta, h.id_volume, h.data
    FROM historico_volume h
    LEFT JOIN volumes v ON h.id_volume = v.id_volume
    WHERE LENGTH(h.barra) = 17
    ORDER BY h.id DESC
    LIMIT 20
  `;
  console.log("Amostras de 17 dígitos em historico_volume:", amostrasHV);

  // Amostra de malotes de 17 dígitos no pre_minuta
  const amostrasPM = await sql`
    SELECT pm.malote, pm.id_minuta, pm.data_hora
    FROM pre_minuta pm
    WHERE LENGTH(pm.malote) = 17
    ORDER BY pm.id DESC
    LIMIT 20
  `;
  console.log("Amostras de 17 dígitos em pre_minuta:", amostrasPM);

  // Vamos pesquisar no pre_minuta por qualquer malote criado na data da minuta (2026-08-14)
  const pmData = await sql`
    SELECT * 
    FROM pre_minuta 
    WHERE data_hora >= '2026-08-14 00:00:00' AND data_hora <= '2026-08-15 23:59:59'
    LIMIT 20
  `;
  console.log("Pre_minuta na data da minuta 1664141 (14/08/2026):", pmData);

  await sql.end();
}

main().catch(console.error);
