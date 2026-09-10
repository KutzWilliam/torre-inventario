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

const codigos = [
  "85626981628706234",
  "43640561864308692",
  "51169191505450555",
  "27602301482104876",
  "19183771741052913",
  "85619047628506204",
  "51152257505250525",
  "27772455482704836",
  "69768948246902478"
];

async function main() {
  console.log("=== INVESTIGAÇÃO DOS 9 CÓDIGOS DE BARRAS ===");

  for (const cod of codigos) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Buscando código: ${cod}`);

    // 1. pre_minuta (malote)
    const pm = await sql`SELECT * FROM pre_minuta WHERE malote = ${cod}`;
    if (pm.length > 0) {
      console.log(`  [PRE_MINUTA.MALOTE] Encontrado! id_minuta = ${pm[0].id_minuta}, data_hora = ${pm[0].data_hora}`);
    } else {
      console.log(`  [PRE_MINUTA.MALOTE] Não encontrado.`);
    }

    // 2. pre_minuta (dentro do campo dados JSON)
    const pmDados = await sql`SELECT id_minuta, malote, data_hora FROM pre_minuta WHERE dados LIKE ${'%' + cod + '%'}`;
    if (pmDados.length > 0) {
      console.log(`  [PRE_MINUTA.DADOS JSON] Encontrado! id_minuta = ${pmDados[0].id_minuta}`);
    }

    // 3. historico_volume
    const hv = await sql`
      SELECT h.id, h.data, h.barra, h.manifesto, h.tipo, h.id_volume, v.id_minuta, v.parcial
      FROM historico_volume h
      LEFT JOIN volumes v ON h.id_volume = v.id_volume
      WHERE h.barra = ${cod}
    `;
    if (hv.length > 0) {
      console.log(`  [HISTORICO_VOLUME] Encontrado! id_volume = ${hv[0].id_volume}, id_minuta = ${hv[0].id_minuta}, manifesto = ${hv[0].manifesto}, data = ${hv[0].data}`);
    } else {
      console.log(`  [HISTORICO_VOLUME] Não encontrado.`);
    }

    // 4. volumes
    const vol = await sql`
      SELECT id_volume, id_minuta, parcial, total, barra, etiqueta, pacote 
      FROM volumes 
      WHERE barra = ${cod} OR etiqueta = ${cod} OR pacote = ${cod}
    `;
    if (vol.length > 0) {
      console.log(`  [VOLUMES] Encontrado! id_minuta = ${vol[0].id_minuta}, id_volume = ${vol[0].id_volume}`);
    } else {
      console.log(`  [VOLUMES] Não encontrado.`);
    }

    // 5. _hash_pre_minuta
    try {
      const hashPm = await sql`SELECT * FROM _hash_pre_minuta WHERE dados LIKE ${'%' + cod + '%'}`;
      if (hashPm.length > 0) {
        console.log(`  [_HASH_PRE_MINUTA] Encontrado!`, hashPm);
      }
    } catch (e) {}

    // 6. processo_volumes
    try {
      const pv = await sql`SELECT * FROM processo_volumes WHERE barra = ${cod}`;
      if (pv.length > 0) {
        console.log(`  [PROCESSO_VOLUMES] Encontrado! id_minuta = ${pv[0].id_minuta}`);
      }
    } catch (e) {}
  }

  await sql.end();
}

main().catch(console.error);
