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
  const idMinuta = 1608314;
  const rows = await sql`
    SELECT 
      m.id_minuta,
      m.cte_numero,
      m.origem,
      m.destino,
      m.status,
      m.total_volumes,
      m.prev_entrega,
      COALESCE(ro.rota, (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.origem::text LIMIT 1), m.origem) AS origem_nome,
      COALESCE(rd.rota, (SELECT a.aeroporto FROM aero a WHERE a.cidade::text = m.destino::text LIMIT 1), m.destino) AS destino_nome,
      r.rota AS rota_nome
    FROM minuta m
    LEFT JOIN rotas r ON m.rota::text = r.id::text
    LEFT JOIN rotas rd ON m.destino::text = rd.id_rota::text
    LEFT JOIN rotas ro ON m.origem::text = ro.id_rota::text
    WHERE m.id_minuta = ${idMinuta}
  `;
  console.log("Minuta traduzida:", rows[0]);
  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
