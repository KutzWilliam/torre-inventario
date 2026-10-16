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
  const tabelas = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (table_name LIKE '%motorista%' OR table_name LIKE '%veicul%' OR table_name LIKE '%placa%')
  `;
  console.log("Tabelas motorista/veiculo:", tabelas.map(t => t.table_name));
  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
