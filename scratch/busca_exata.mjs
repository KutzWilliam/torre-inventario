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
  const barra = "19183771741052913";

  console.log("=== BUSCA EXATA '=' EM TODAS AS TABELAS ===");
  const tables = await sql`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND data_type IN ('text', 'character varying', 'character', 'bigint', 'integer')
  `;

  let totalMatches = 0;
  for (const t of tables) {
    try {
      const res = await sql.unsafe(`
        SELECT * FROM "${t.table_name}" 
        WHERE "${t.column_name}"::text = '${barra}' 
        LIMIT 5
      `);
      if (res.length > 0) {
        console.log(`>>> ENCONTRADO em ${t.table_name}.${t.column_name}:`, res);
        totalMatches++;
      }
    } catch (e) {}
  }

  console.log(`Fim da busca exata. Total matches: ${totalMatches}`);
  await sql.end();
}

main().catch(console.error);
