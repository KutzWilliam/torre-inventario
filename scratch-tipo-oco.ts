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
    const cols = await dbReadonly`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tipo_oco'
      ORDER BY ordinal_position
    `;
    console.table(cols);

    const sample = await dbReadonly`SELECT * FROM tipo_oco LIMIT 5`;
    console.table(sample);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
main();
