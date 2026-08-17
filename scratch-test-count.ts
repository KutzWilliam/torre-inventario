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
  const unidadeId = 6; // Ponta Grossa example ID? Let's check which ID corresponds to Ponta Grossa. We will query all.
  
  try {
    const q1 = await dbReadonly`
      WITH UltimaMovimentacao AS (
        SELECT DISTINCT ON (h.barra)
          h.barra,
          p.unidade        AS picking_unidade,
          p.tipo           AS picking_tipo,
          m.status         AS minuta_status
        FROM historico_volume h
        INNER JOIN picking   p   ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
        INNER JOIN volumes   v   ON h.id_volume  = v.id_volume
        INNER JOIN minuta    m   ON v.id_minuta  = m.id_minuta
        WHERE h.data >= NOW() - INTERVAL '90 days'
          AND m.status NOT IN (6, 13)
          AND m.cte_numero != 0
        ORDER BY h.barra, h.id DESC
      )
      SELECT picking_unidade, COUNT(*) 
      FROM UltimaMovimentacao 
      WHERE picking_tipo = 2
      GROUP BY picking_unidade
      ORDER BY COUNT(*) DESC
      LIMIT 10;
    `;
    console.log("Fechamento count per unit:");
    console.table(q1);
    
    const q2 = await dbReadonly`
      WITH UltimaMovimentacao AS (
        SELECT DISTINCT ON (h.barra)
          h.barra,
          p.unidade        AS picking_unidade,
          p.tipo           AS picking_tipo,
          m.status         AS minuta_status,
          man.status       AS manifesto_status
        FROM historico_volume h
        INNER JOIN picking   p   ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
        INNER JOIN volumes   v   ON h.id_volume  = v.id_volume
        INNER JOIN minuta    m   ON v.id_minuta  = m.id_minuta
        LEFT  JOIN manifesto man ON h.manifesto  = man.id_manifesto
        WHERE h.data >= NOW() - INTERVAL '90 days'
          AND m.status NOT IN (6, 13)
          AND m.cte_numero != 0
        ORDER BY h.barra, h.id DESC
      )
      SELECT
        u.id_unidade,
        u.fantasia,
        COUNT(*) AS total_volumes,
        COUNT(*) FILTER (WHERE d.picking_tipo = 2) AS no_patio
      FROM UltimaMovimentacao d
      INNER JOIN unidades u ON u.id_unidade = d.picking_unidade
      WHERE u.status = 1
        AND d.picking_tipo = 2
      GROUP BY u.id_unidade, u.fantasia
      ORDER BY COUNT(*) DESC
      LIMIT 10;
    `;
    console.log("Dashboard count per unit:");
    console.table(q2);

  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

main();
