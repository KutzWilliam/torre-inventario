import postgres from "postgres";

const sql = postgres({
  host: "172.20.10.205",
  port: 5432,
  database: "torre_controle",
  username: "torre_vw",
  password: "!Epc#Torre2@",
  max: 2,
  connect_timeout: 10,
});

async function main() {
  const idMinuta = 1664141;
  const barra = "19183771741052913";

  console.log("=== 1. BUSCANDO '19183771741052913' EM TODAS AS 62 TABELAS ===");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;

  for (const t of tables) {
    const tab = t.table_name;
    try {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${tab}
      `;
      for (const c of cols) {
        try {
          const res = await sql.unsafe(`
            SELECT * FROM "${tab}" 
            WHERE "${c.column_name}"::text LIKE '%${barra}%' 
            LIMIT 5
          `);
          if (res.length > 0) {
            console.log(`>>> [MATCH DIRETO DA BARRA] ${tab}.${c.column_name}:`, res);
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  console.log("\n=== 2. NOTAS FISCAIS DA MINUTA 1664141 ===");
  try {
    const nfRows = await sql`SELECT * FROM notas_fiscais WHERE id_minuta = ${idMinuta} OR frete = ${idMinuta}`;
    console.log("notas_fiscais rows:", nfRows);
  } catch (e) {
    console.log("Erro notas_fiscais:", e.message);
  }

  console.log("\n=== 3. PROCESSO_VOLUMES / PROCESSO_NOTAS ===");
  try {
    const pv = await sql`SELECT * FROM processo_volumes WHERE id_minuta = ${idMinuta}`;
    console.log("processo_volumes por id_minuta:", pv);
  } catch (e) {
    console.log("Erro processo_volumes:", e.message);
  }

  console.log("\n=== 4. COLETA / COTACAO ===");
  try {
    // da minuta: coleta_numero = 270875
    const coletaRows = await sql`SELECT * FROM coleta WHERE id_coleta = 270875 OR numero = 270875`;
    console.log("coleta:", coletaRows);
  } catch (e) {
    console.log("Erro coleta:", e.message);
  }

  console.log("\n=== 5. MANIFESTO_LIST ===");
  try {
    const mlist = await sql`SELECT * FROM manifesto_list WHERE id_minuta = ${idMinuta}`;
    console.log("manifesto_list:", mlist);
  } catch (e) {
    console.log("Erro manifesto_list:", e.message);
  }

  console.log("\n=== 6. BUSCANDO PADRÕES DE BARRAS DE 17 DÍGITOS NO BANCO ===");
  // Vamos ver exemplos de barras de 17 dígitos no historico_volume ou pre_minuta
  const sampleHist = await sql`
    SELECT barra, LENGTH(barra) as len 
    FROM historico_volume 
    WHERE LENGTH(barra) = 17 
    LIMIT 10
  `;
  console.log("Exemplos de barras de 17 digitos em historico_volume:", sampleHist);

  const samplePM = await sql`
    SELECT malote, LENGTH(malote) as len 
    FROM pre_minuta 
    WHERE LENGTH(malote) = 17 
    LIMIT 10
  `;
  console.log("Exemplos de barras de 17 digitos em pre_minuta:", samplePM);

  await sql.end();
}

main().catch(console.error);
