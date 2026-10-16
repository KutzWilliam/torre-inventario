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
  const [v] = await sql`SELECT * FROM veiculos LIMIT 1`;
  console.log("Amostra veiculos:", v ? Object.keys(v) : null);
  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
