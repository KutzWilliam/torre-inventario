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
  try {
    // Estrutura de processo_notas
    const cols1 = await dbReadonly`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'processo_notas'
      ORDER BY ordinal_position
    `;
    console.log("=== processo_notas columns ===");
    console.table(cols1);

    // Amostra de dados
    const sample = await dbReadonly`SELECT * FROM processo_notas LIMIT 5`;
    console.log("=== processo_notas sample ===");
    console.table(sample);

    // Estrutura de processo
    const cols2 = await dbReadonly`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'processo'
      ORDER BY ordinal_position
    `;
    console.log("=== processo columns ===");
    console.table(cols2);

    // Amostra
    const sample2 = await dbReadonly`SELECT * FROM processo LIMIT 5`;
    console.log("=== processo sample ===");
    console.table(sample2);

  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

main();
