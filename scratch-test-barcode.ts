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
    const pVol = await dbReadonly`
      SELECT pv.*, p.id_oco, p.status, p.data_evento 
      FROM processo_volumes pv
      LEFT JOIN processo p ON pv.id_processo = p.id_processo
      LIMIT 10
    `;
    console.log("Random Processo Volumes:");
    console.table(pVol);
    
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

main();
