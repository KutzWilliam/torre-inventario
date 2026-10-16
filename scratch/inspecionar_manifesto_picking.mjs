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
  console.log("=== AMOSTRA DE PICKING ===");
  const amostraPicking = await sql`
    SELECT * FROM picking ORDER BY id DESC LIMIT 5
  `;
  console.log("Amostra picking:", amostraPicking);

  console.log("\n=== TABELAS LIGADAS A MANIFESTO ===");
  const tabelasManifesto = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%manifest%'
  `;
  console.log("Tabelas ligadas a manifesto:", tabelasManifesto.map(t => t.table_name));

  console.log("\n=== COMO O HISTORICO_VOLUME SE CONECTA COM MANIFESTO E UNIDADE ===");
  const amostraHist = await sql`
    SELECT h.id, h.barra, h.manifesto, h.tipo as h_tipo, h.data,
           p.tipo as p_tipo, p.unidade, u.fantasia as unidade_fantasia,
           m.base as manifesto_base, m.tipo as manifesto_tipo, m.status as manifesto_status
    FROM historico_volume h
    LEFT JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
    LEFT JOIN unidades u ON p.unidade = u.id_unidade
    LEFT JOIN manifesto m ON h.manifesto = m.id_manifesto
    ORDER BY h.id DESC
    LIMIT 5
  `;
  console.log("Historico_volume amostra:", amostraHist);

  console.log("\n=== EXEMPLO REAL DE UMA MINUTA COM SEUS VOLUMES E MOVIMENTAÇÕES ===");
  // Vamos pegar uma minuta que tenha histórico de volume recente
  const minutaExemplo = await sql`
    SELECT v.id_minuta, count(distinct v.barras) as total_barras
    FROM volumes v
    INNER JOIN historico_volume h ON h.id_volume = v.id_volume
    WHERE h.data >= NOW() - INTERVAL '10 days'
    GROUP BY v.id_minuta
    HAVING count(distinct v.barras) >= 2
    LIMIT 1
  `;
  console.log("Minuta exemplo:", minutaExemplo);

  if (minutaExemplo.length > 0) {
    const idMinuta = minutaExemplo[0].id_minuta;
    const [minuta] = await sql`SELECT * FROM minuta WHERE id_minuta = ${idMinuta}`;
    console.log("\nDados Minuta:", {
      id_minuta: minuta.id_minuta,
      origem: minuta.origem,
      destino: minuta.destino,
      status: minuta.status,
      total_volumes: minuta.total_volumes,
      cte_numero: minuta.cte_numero,
    });

    const volumes = await sql`SELECT id_volume, barras, parcial FROM volumes WHERE id_minuta = ${idMinuta}`;
    console.log("Volumes da minuta:", volumes);

    const movs = await sql`
      SELECT h.barra, h.data, h.tipo as tipo_h, h.manifesto,
             p.unidade as picking_unidade, u.fantasia as unidade_nome,
             man.base as manifesto_base, man.status as man_status
      FROM historico_volume h
      INNER JOIN volumes v ON h.id_volume = v.id_volume
      LEFT JOIN picking p ON h.manifesto = p.id_manifesto AND p.tipo = h.tipo
      LEFT JOIN unidades u ON p.unidade = u.id_unidade
      LEFT JOIN manifesto man ON h.manifesto = man.id_manifesto
      WHERE v.id_minuta = ${idMinuta}
      ORDER BY h.data ASC, h.id ASC
    `;
    console.log("Movimentações dos volumes da minuta:", movs);
  }

  await sql.end();
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
