import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const dbReadonly = postgres({
  host: process.env.READONLY_DB_HOST,
  port: parseInt(process.env.READONLY_DB_PORT || "5432", 10),
  database: process.env.READONLY_DB_NAME,
  username: process.env.READONLY_DB_USER,
  password: process.env.READONLY_DB_PASS,
  max: 1,
  onnotice: () => void 0,
});

async function main() {
  const tables = [
    "processo",
    "processo_anexos",
    "processo_autorizacao",
    "processo_empresa",
    "processo_notas",
    "processo_notas_fiscais",
    "processo_volumes"
  ];

  for (const table of tables) {
    console.log(`\n--- Structure for table: ${table} ---`);
    try {
      const columns = await dbReadonly`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table}
        ORDER BY ordinal_position;
      `;
      if (columns.length === 0) {
        console.log("No columns found (table might not exist or schema differs)");
      } else {
        console.table(columns);
      }
    } catch (e) {
      console.error(`Error querying table ${table}:`, e);
    }
  }

  process.exit(0);
}

main();
