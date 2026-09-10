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
  const idMinuta = 1664141;
  const barra = "19183771741052913";

  // Ver colunas de notas_fiscais
  const colsNF = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'notas_fiscais'
  `;
  console.log("Colunas notas_fiscais:", colsNF.map(c => c.column_name).join(", "));

  // Ver notas da minuta 1664141
  const nf = await sql`SELECT * FROM notas_fiscais WHERE frete = ${idMinuta} LIMIT 10`;
  console.log("\nNotas fiscais da minuta 1664141:", nf);

  // Ver colunas de processo_volumes
  const colsPV = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'processo_volumes'
  `;
  console.log("\nColunas processo_volumes:", colsPV.map(c => c.column_name).join(", "));

  // Ver processo_volumes
  const pv = await sql`SELECT * FROM processo_volumes WHERE frete = ${idMinuta} OR id_minuta = ${idMinuta} LIMIT 10`.catch(e => e.message);
  console.log("\nProcesso volumes:", pv);

  // Ver se o código 19183771741052913 está em alguma coluna de notas_fiscais
  for (const c of colsNF) {
    if (['text', 'character varying', 'character'].includes(c.data_type)) {
      const res = await sql.unsafe(`SELECT * FROM notas_fiscais WHERE "${c.column_name}"::text LIKE '%1918377%' LIMIT 2`);
      if (res.length > 0) {
        console.log(`>>> MATCH notas_fiscais.${c.column_name}:`, res);
      }
    }
  }

  await sql.end();
}

main().catch(console.error);
