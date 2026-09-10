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
  console.log("=== INVESTIGAÇÃO DA TABELA VOLUMES E COLUNA BARRA ===\n");

  // Colunas: id_volume, id_minuta, parcial, total, peso, status, lote, comprimento,
  //          largura, altura, cubagem, barra, id_coleta, id_cotacao, etiqueta,
  //          id_nf, chave, pacote, id_awb

  // 1. Ver amostra da coluna barra (que vem do MySQL original)
  const amostraBarra = await sql`
    SELECT id_volume, id_minuta, barra, etiqueta, pacote, parcial, total
    FROM volumes
    WHERE barra IS NOT NULL AND barra != ''
    LIMIT 15
  `;
  console.log("Amostra volumes.barra:");
  for (const r of amostraBarra) console.log(JSON.stringify(r));

  // 2. Comprimentos da coluna barra
  const compBarra = await sql`
    SELECT LENGTH(barra) as len, COUNT(*) as qtd
    FROM volumes
    WHERE barra IS NOT NULL AND barra != ''
    GROUP BY len ORDER BY qtd DESC LIMIT 10
  `;
  console.log("\nComprimentos de volumes.barra:", JSON.stringify(compBarra));

  // 3. Comprimentos de etiqueta
  const compEtiq = await sql`
    SELECT LENGTH(etiqueta::text) as len, COUNT(*) as qtd
    FROM volumes
    WHERE etiqueta IS NOT NULL AND etiqueta != ''
    GROUP BY len ORDER BY qtd DESC LIMIT 10
  `;
  console.log("\nComprimentos de volumes.etiqueta:", JSON.stringify(compEtiq));

  // 4. Comprimentos de pacote
  const compPacote = await sql`
    SELECT LENGTH(pacote::text) as len, COUNT(*) as qtd
    FROM volumes
    WHERE pacote IS NOT NULL AND pacote != 0
    GROUP BY len ORDER BY qtd DESC LIMIT 10
  `;
  console.log("\nComprimentos de volumes.pacote:", JSON.stringify(compPacote));

  // 5. Cruzamento: barra bipada (17 dígitos no historico) X volumes.barra, etiqueta, pacote
  const cruzado = await sql`
    SELECT 
      h.barra AS barra_bipada,
      LENGTH(h.barra::text) AS len_bipada,
      v.barra AS vol_barra,
      LENGTH(v.barra) AS vol_barra_len,
      v.etiqueta,
      LENGTH(v.etiqueta::text) AS etiq_len,
      v.pacote,
      v.id_minuta,
      v.parcial,
      v.total
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE LENGTH(h.barra::text) = 17
    LIMIT 20
  `;
  console.log("\nCruzamento barra_bipada(17dig) X volumes:");
  for (const r of cruzado) console.log(JSON.stringify(r));

  // 6. O campo 'barra' na tabela volumes tem 17 dígitos? Ou é diferente?
  // Vamos ver volumes onde a barra bipada != barra do volumes
  const diff = await sql`
    SELECT 
      h.barra AS barra_bipada,
      v.barra AS vol_barra,
      v.etiqueta,
      v.pacote,
      (h.barra = v.barra) AS sao_iguais,
      v.id_minuta
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE h.barra IS NOT NULL AND v.barra IS NOT NULL
      AND h.barra != v.barra
    LIMIT 20
  `;
  console.log("\nOnde barra_bipada != vol.barra (barras diferentes):");
  for (const r of diff) console.log(JSON.stringify(r));

  // 7. Ver volumes que NÃO têm historico_volume (volumes sem bipagem alguma)
  // e qual é o conteúdo do campo barra neles
  const semBipagem = await sql`
    SELECT v.id_volume, v.id_minuta, v.barra, v.etiqueta, v.pacote, v.parcial, v.total
    FROM volumes v
    WHERE NOT EXISTS (SELECT 1 FROM historico_volume h WHERE h.id_volume = v.id_volume)
      AND v.id_minuta IS NOT NULL
    LIMIT 15
  `;
  console.log("\nVolumes SEM bipagem no historico_volume:");
  for (const r of semBipagem) console.log(JSON.stringify(r));

  // 8. Verificar se podemos relacionar volumes.barra com a barra bipada
  // via alguma transformação matemática
  // Teoria: encodeBar(barras_no_mysql) = numero_etiqueta_17_digitos
  // Vamos ver: a barra do mysql (volumes.barra) vs barra bipada (17 digs)
  // Se são diferentes, qual é o padrão?
  const amostras17 = await sql`
    SELECT 
      h.barra AS barra_bipada,
      v.barra AS vol_barra,
      v.etiqueta,
      v.id_volume,
      v.id_minuta,
      v.parcial
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE LENGTH(h.barra::text) = 17
      AND v.barra IS NOT NULL
    LIMIT 30
  `;
  console.log("\nAmostra 30 registros com barra_bipada de 17 dígitos:");
  for (const r of amostras17) console.log(JSON.stringify(r));

  // 9. Ver se existe alguma relação entre id_volume e a barra bipada
  const idVsBarra = await sql`
    SELECT 
      h.barra,
      h.id_volume,
      v.barra as vol_barra,
      v.etiqueta,
      v.parcial,
      v.id_minuta
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE h.barra IS NOT NULL
    ORDER BY h.id DESC
    LIMIT 20
  `;
  console.log("\nÚltimas 20 do historico_volume cruzadas com volumes:");
  for (const r of idVsBarra) console.log(JSON.stringify(r));

  await sql.end();
}

main().catch(console.error);
