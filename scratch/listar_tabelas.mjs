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
  const tabs = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log("=== TODAS AS TABELAS DO BANCO (" + tabs.length + ") ===");
  console.log(tabs.map(t => t.table_name).join("\n"));

  await sql.end();
}

main().catch(console.error);
