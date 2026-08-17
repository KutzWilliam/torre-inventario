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
    const unidades = await dbReadonly`
      SELECT id_unidade, fantasia 
      FROM unidades 
      WHERE fantasia ILIKE '%ponta grossa%'
    `;
    console.log(unidades);
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

main();
