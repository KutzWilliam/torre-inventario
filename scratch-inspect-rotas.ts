import postgres from "postgres";
import "dotenv/config";

const dbReadonly = postgres({
  host: process.env.READONLY_DB_HOST,
  port: parseInt(process.env.READONLY_DB_PORT || "5432", 10),
  database: process.env.READONLY_DB_NAME,
  username: process.env.READONLY_DB_USER,
  password: process.env.READONLY_DB_PASS,
});

async function main() {
  try {
    const sample = await dbReadonly`
      SELECT id, rota, praca, id_rota FROM rotas WHERE id = 76 OR id_rota = '76';
    `;
    console.log("Sample data from rotas:", sample);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
