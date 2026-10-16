import postgres from "postgres";

const sql = postgres({
  host: process.env.READONLY_DB_HOST || "172.20.10.205",
  port: Number(process.env.READONLY_DB_PORT) || 5432,
  database: process.env.READONLY_DB_NAME || "torre_controle",
  username: process.env.READONLY_DB_USER || "torre_vw",
  password: process.env.READONLY_DB_PASSWORD || "!Epc#Torre2@",
  max: 2,
  connect_timeout: 10,
});

async function testar(termo) {
  console.log(`\n=== TESTANDO BUSCA POR: ${termo} ===`);
  const termoNum = Number(termo);
  const isNum = !isNaN(termoNum) && termoNum > 0;

  // 1. Minuta direta
  const porMinuta = await sql`
    SELECT id_minuta, cte_numero, origem, destino, status, total_volumes 
    FROM minuta 
    WHERE id_minuta = ${termoNum}
  `;
  console.log("Achou por minuta.id_minuta:", porMinuta);

  // 2. CTE
  const porCte = await sql`
    SELECT id_minuta, cte_numero, origem, destino, status, total_volumes 
    FROM minuta 
    WHERE cte_numero = ${termoNum} OR cte_numero::text = ${termo}
  `;
  console.log("Achou por cte_numero:", porCte);

  // 3. Volumes
  const porVol = await sql`
    SELECT id_minuta, barras, parcial 
    FROM volumes 
    WHERE barras = ${termo} OR id_minuta = ${termoNum}
    LIMIT 5
  `;
  console.log("Achou por volumes:", porVol);
}

async function main() {
  await testar("1808947");
  await testar("1805226");
  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
