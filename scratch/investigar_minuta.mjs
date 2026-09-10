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

  console.log("=== DETALHES COMPLETOS DA MINUTA 1664141 ===");
  const [minuta] = await sql`SELECT * FROM minuta WHERE id_minuta = ${idMinuta}`;
  console.log("Minuta:", JSON.stringify(minuta, null, 2));

  console.log("\n=== VOLUMES ===");
  const volumes = await sql`SELECT * FROM volumes WHERE id_minuta = ${idMinuta}`;
  console.log("Volumes:", JSON.stringify(volumes, null, 2));

  console.log("\n=== NOTAS FISCAIS (se houver tabela nfe/nota) ===");
  // Vamos buscar notas fiscais da minuta
  try {
    const nfs = await sql`SELECT * FROM nfe WHERE id_minuta = ${idMinuta}`;
    console.log("nfe por id_minuta:", nfs);
  } catch (e) {
    console.log("Erro nfe id_minuta:", e.message);
  }

  try {
    const notas = await sql`SELECT * FROM nota_fiscal WHERE id_minuta = ${idMinuta} OR frete = ${idMinuta}`;
    console.log("nota_fiscal:", notas);
  } catch (e) {
    console.log("Erro nota_fiscal:", e.message);
  }

  // CTE
  if (minuta && minuta.cte_numero) {
    console.log("\n=== CTE ===");
    try {
      const cte = await sql`SELECT * FROM cte WHERE numero = ${minuta.cte_numero} OR id_minuta = ${idMinuta}`;
      console.log("CTE:", cte);
    } catch (e) {
      console.log("Erro CTE:", e.message);
    }
  }

  // Verificar tabelas que contenham "edi", "etiqueta", "leitura", "volume", "bip"
  const tabelas = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  const nomes = tabelas.map(t => t.table_name);
  console.log("\n=== TABELAS RELEVANTES NO BANCO ===");
  const relevantes = nomes.filter(n => 
    n.includes('edi') || n.includes('etiq') || n.includes('barr') || 
    n.includes('vol') || n.includes('bip') || n.includes('leit') || 
    n.includes('rast') || n.includes('minut') || n.includes('mov') ||
    n.includes('doc') || n.includes('carga') || n.includes('exped') ||
    n.includes('pre') || n.includes('picking')
  );
  console.log("Tabelas relevantes:", relevantes);

  // Vamos testar cada uma dessas tabelas para a barra
  console.log("\n=== BUSCANDO A BARRA NAS TABELAS RELEVANTES ===");
  for (const tab of relevantes) {
    try {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${tab}
          AND data_type IN ('text', 'character varying', 'character', 'bigint', 'integer')
      `;
      for (const c of cols) {
        const res = await sql.unsafe(`
          SELECT * FROM "${tab}" WHERE "${c.column_name}"::text LIKE '%${barra}%' LIMIT 5
        `);
        if (res.length > 0) {
          console.log(`>>> MATCH ENCONTRADO em ${tab}.${c.column_name}:`, res);
        }
      }
    } catch (e) {}
  }

  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
