import postgres from "postgres";

const sql = postgres({
  host: "172.20.10.205",
  port: 5432,
  database: "torre_controle",
  username: "torre_vw",
  password: "!Epc#Torre2@",
  max: 1,
  connect_timeout: 10,
});

async function main() {
  const idMinuta = 1664141;
  const barra = "19183771741052913";

  console.log("=== NOTAS FISCAIS DA MINUTA 1664141 ===");
  const nfs = await sql`SELECT * FROM notas_fiscais WHERE id_minuta = ${idMinuta}`;
  console.log("Total de NFs:", nfs.length);
  console.log(JSON.stringify(nfs, null, 2));

  console.log("\n=== BUSCAR SE O CÓDIGO DA ETIQUETA / PARTE DELE CONSTA EM NOTAS_FISCAIS ===");
  const nfChave = await sql`
    SELECT * FROM notas_fiscais 
    WHERE chave LIKE '%1918377%' 
       OR chave_nfe LIKE '%1918377%' 
       OR pedido LIKE '%1918377%' 
       OR nf::text LIKE '%1918377%'
    LIMIT 5
  `;
  console.log("NFs com 1918377:", nfChave);

  await sql.end();
}

main().catch(console.error);
