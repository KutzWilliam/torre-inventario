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

async function main() {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'frete_hist'
    ORDER BY ordinal_position
  `;
  console.log("frete_hist cols:", cols.map(c => c.column_name));

  const [amostra] = await sql`SELECT * FROM frete_hist WHERE frete = 1808947 LIMIT 2`;
  console.log("amostra frete_hist:", amostra);

  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
