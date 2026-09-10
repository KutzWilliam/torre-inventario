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
  console.log("=== INICIANDO INVESTIGAÇÃO ===");
  const barra = "19183771741052913";
  const idMinuta = 1664141;

  // 1. Minuta 1664141
  console.log("\n--- 1. Tabela minuta ---");
  const minutaRows = await sql`SELECT * FROM minuta WHERE id_minuta = ${idMinuta}`;
  console.log("Minuta rows:", minutaRows);

  // 2. Volumes da Minuta
  console.log("\n--- 2. Tabela volumes da minuta ---");
  const volumesRows = await sql`SELECT * FROM volumes WHERE id_minuta = ${idMinuta}`;
  console.log("Volumes rows:", volumesRows);

  // 3. Pre minuta por id_minuta ou malote
  console.log("\n--- 3. Tabela pre_minuta ---");
  const preMinutaId = await sql`SELECT * FROM pre_minuta WHERE id_minuta = ${idMinuta}`;
  console.log("pre_minuta por id_minuta:", preMinutaId);
  const preMinutaBarra = await sql`SELECT * FROM pre_minuta WHERE malote LIKE ${'%' + barra + '%'}`;
  console.log("pre_minuta por barra:", preMinutaBarra);

  // 4. Historico volume
  console.log("\n--- 4. Tabela historico_volume ---");
  const histBarra = await sql`SELECT * FROM historico_volume WHERE barra LIKE ${'%' + barra + '%'}`;
  console.log("historico_volume por barra:", histBarra);

  // 5. Pesquisa profunda: buscar '19183771741052913' em TODAS as colunas de TODAS as tabelas do banco!
  console.log("\n--- 5. Procurando em TODAS as tabelas do banco onde '19183771741052913' aparece ---");
  const columns = await sql`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND data_type IN ('text', 'character varying', 'character')
    ORDER BY table_name, column_name
  `;

  console.log(`Total de colunas de texto para testar: ${columns.length}`);

  const matches = [];
  for (const col of columns) {
    try {
      const q = await sql.unsafe(`
        SELECT "${col.column_name}" AS val, * 
        FROM "${col.table_name}" 
        WHERE "${col.column_name}"::text LIKE '%${barra}%' 
        LIMIT 5
      `);
      if (q.length > 0) {
        console.log(`>>> MATCH ENCONTRADO! Tabela: ${col.table_name}, Coluna: ${col.column_name}`);
        console.log(q);
        matches.push({ table: col.table_name, column: col.column_name, data: q });
      }
    } catch (e) {
      // ignora tabelas que possam dar erro de permissão ou query
    }
  }

  // 6. Também vamos buscar partes do código (ex: 1918377 ou 741052913 ou id_minuta 1664141)
  console.log("\n--- 6. Resumo das tabelas relacionadas a minuta 1664141 ---");
  const colMinuta = await sql`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND (column_name LIKE '%minuta%' OR column_name LIKE '%frete%')
  `;
  for (const col of colMinuta) {
    try {
      const q = await sql.unsafe(`
        SELECT * FROM "${col.table_name}" WHERE "${col.column_name}"::text = '${idMinuta}' LIMIT 5
      `);
      if (q.length > 0) {
        console.log(`Tabela com id_minuta: ${col.table_name}.${col.column_name} -> ${q.length} registros`);
        console.log(q[0]);
      }
    } catch (e) {}
  }

  await sql.end();
}

main().catch(err => {
  console.error("Erro na investigação:", err);
  process.exit(1);
});
