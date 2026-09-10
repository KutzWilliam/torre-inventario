import postgres from "postgres";

const sql = postgres({
  host: "172.20.10.205",
  port: 5432,
  database: "torre_controle",
  username: "torre_vw",
  password: "!Epc#Torre2@",
  max: 2,
  connect_timeout: 10,
});

async function main() {
  const idMinuta = 1664141;
  const barra = "19183771741052913";

  console.log("=== 1. NOTAS FISCAIS DA MINUTA 1664141 ===");
  const nfRows = await sql`
    SELECT * 
    FROM notas_fiscais 
    WHERE id_minuta = ${idMinuta} OR frete = ${idMinuta}
  `;
  console.log("notas_fiscais:", nfRows);

  console.log("\n=== 2. NOTAS FISCAIS COM A BARRA OU PARTE DELA ===");
  const nfBarra = await sql`
    SELECT * 
    FROM notas_fiscais 
    WHERE numero::text LIKE '%1918377%' 
       OR chave LIKE '%1918377%' 
       OR pedido LIKE '%1918377%'
    LIMIT 5
  `;
  console.log("notas_fiscais com 1918377:", nfBarra);

  console.log("\n=== 3. PROCESSO_VOLUMES / PROCESSO_NOTAS ===");
  const pv = await sql`
    SELECT * 
    FROM processo_volumes 
    WHERE id_minuta = ${idMinuta} 
       OR barra = ${barra}
    LIMIT 5
  `;
  console.log("processo_volumes:", pv);

  const pn = await sql`
    SELECT * 
    FROM processo_notas 
    WHERE id_minuta = ${idMinuta} 
    LIMIT 5
  `;
  console.log("processo_notas:", pn);

  console.log("\n=== 4. COLETA E COTAÇÃO ===");
  const col = await sql`
    SELECT * 
    FROM coleta 
    WHERE id_coleta = 270875 OR numero = 270875
  `;
  console.log("coleta 270875:", col);

  console.log("\n=== 5. PRE_MINUTA ===");
  const pm = await sql`
    SELECT * 
    FROM pre_minuta 
    WHERE malote = ${barra} 
       OR id_minuta = ${idMinuta}
  `;
  console.log("pre_minuta:", pm);

  console.log("\n=== 6. HISTORICO_VOLUME ===");
  const hv = await sql`
    SELECT * 
    FROM historico_volume 
    WHERE barra = ${barra}
  `;
  console.log("historico_volume da barra:", hv);

  console.log("\n=== 7. VOLUMES ===");
  const v = await sql`
    SELECT * 
    FROM volumes 
    WHERE barra = ${barra} 
       OR etiqueta = ${barra} 
       OR pacote = ${barra}
  `;
  console.log("volumes da barra:", v);

  console.log("\n=== 8. MANIFESTO_LIST ===");
  const ml = await sql`
    SELECT * 
    FROM manifesto_list 
    WHERE id_minuta = ${idMinuta}
  `;
  console.log("manifesto_list:", ml);

  await sql.end();
}

main().catch(console.error);
