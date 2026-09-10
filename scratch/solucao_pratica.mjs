// Foco na solução prática:
// Ao invés de tentar descobrir encodeBar, vamos verificar:
// 1. A barra bipada (17 digs) está na tabela volumes.barra? → NÃO (barra lá é de 16 digs)
// 2. Podemos buscar na tabela volumes usando partes da barra bipada?
// 3. Alternativa: buscar na tabela volumes via pre_minuta (malote = barra bipada)

// O problema real:
// Quando um volume NÃO tem bipagem (histórico) nem pré-minuta (malote),
// não conseguimos achar sua minuta.
//
// Solução via volumes:
// Se soubéssemos como converter barra_bipada → vol.barra (ou barra_bipada → id_volume),
// poderíamos buscar direto na tabela volumes.
//
// DESCOBERTA CHAVE:
// A col barra na tabela volumes segue: id_minuta(8) + parcial(4) + total(4)
// Mas a barra bipada de 17 dígitos é diferente.
//
// SOLUÇÃO ALTERNATIVA SEM encodeBar:
// Quando buscamos por barra_bipada e não encontramos em pre_minuta nem historico_volume,
// temos um problema. Mas será que existe outra tabela?
//
// Vamos verificar se conseguimos converter vol.barra ↔ barra_bipada
// Mais especificamente: ver se ao menos a minuta pode ser extraída da barra_bipada

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
  console.log("=== INVESTIGAÇÃO FOCADA: BUSCA SEM encodeBar ===\n");

  // 1. Ver se a tabela volumes tem a barra bipada em alguma coluna
  // (já sabemos que barra=16digs, mas ver etiqueta, pacote, etc.)
  const amos = await sql`
    SELECT id_volume, id_minuta, barra, etiqueta, pacote, chave, lote, id_awb
    FROM volumes
    WHERE id_minuta = 22021
    ORDER BY parcial
  `;
  console.log("Volumes da minuta 22021:");
  for (const r of amos) console.log(JSON.stringify(r));

  // 2. Ver estrutura de etiqueta, pacote
  console.log("\nEtiqueta e pacote - tipos e exemplos:");
  const tiposCols = await sql`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'volumes' AND column_name IN ('etiqueta','pacote','barra','chave','lote','id_awb')
  `;
  console.log(tiposCols.map(c => `${c.column_name}: ${c.data_type}`).join(', '));

  // 3. Ver a tabela pre_minuta - o campo malote já tem a barra bipada
  // Mas o problema é volumes que não têm pre_minuta
  // Vamos ver: há volumes sem pre_minuta?
  const semPreMinuta = await sql`
    SELECT COUNT(*) as total FROM volumes v
    WHERE NOT EXISTS (
      SELECT 1 FROM pre_minuta pm 
      WHERE pm.id_minuta = v.id_minuta
    )
    AND v.id_minuta IS NOT NULL
  `;
  console.log("\nVolumes sem pre_minuta:", semPreMinuta[0].total);

  // 4. Verificar: há volumes com minuta mas sem historico_volume e sem pre_minuta?
  const semTudo = await sql`
    SELECT COUNT(*) as total FROM volumes v
    WHERE NOT EXISTS (SELECT 1 FROM historico_volume h WHERE h.id_volume = v.id_volume)
      AND NOT EXISTS (SELECT 1 FROM pre_minuta pm WHERE pm.id_minuta = v.id_minuta)
      AND v.id_minuta IS NOT NULL
  `;
  console.log("Volumes SEM historico E SEM pre_minuta:", semTudo[0].total);

  // 5. Verificar: existe a barra bipada como parte da vol.barra?
  // vol.barra = MMMMMMMMPPPPTTTT (16 chars)
  // barra bipada = 17 chars
  // Tese: os 8 chars centrais do vol.barra contêm a minuta
  // Logo: podemos extrair id_minuta de vol.barra e fazer JOIN com pre_minuta
  const testBarra = await sql`
    SELECT 
      v.barra,
      CAST(SUBSTRING(v.barra, 1, 8) AS BIGINT) AS id_minuta_extraido,
      CAST(SUBSTRING(v.barra, 9, 4) AS INTEGER) AS parcial_extraido,
      CAST(SUBSTRING(v.barra, 13, 4) AS INTEGER) AS total_extraido,
      v.id_minuta AS id_minuta_real,
      v.parcial AS parcial_real,
      v.total AS total_real
    FROM volumes v
    WHERE v.barra IS NOT NULL AND LENGTH(v.barra) = 16
    LIMIT 10
  `;
  console.log("\nExtração de id_minuta/parcial/total de vol.barra:");
  for (const r of testBarra) console.log(JSON.stringify(r));

  // 6. MUITO IMPORTANTE: Ver quantos volumes tem barra com 16 dígitos
  // E se a extração acima coincide com id_minuta real
  const validacaoBarra = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE CAST(SUBSTRING(barra, 1, 8) AS BIGINT) = CAST(id_minuta AS BIGINT)) AS min_ok,
      COUNT(*) FILTER (WHERE CAST(SUBSTRING(barra, 9, 4) AS INTEGER) = CAST(parcial AS BIGINT)) AS par_ok,
      COUNT(*) FILTER (WHERE CAST(SUBSTRING(barra, 13, 4) AS INTEGER) = CAST(total AS BIGINT)) AS tot_ok,
      COUNT(*) AS total
    FROM volumes
    WHERE barra IS NOT NULL AND LENGTH(barra) = 16
  `;
  console.log("\nValidação da extração de vol.barra:", validacaoBarra[0]);

  // 7. SOLUÇÃO PROPOSTA: Buscar na tabela volumes pelo id_minuta extraído de vol.barra
  // Mas ainda precisamos saber o id_volume a partir da barra_bipada (17 digs)
  // A ligação é: barra_bipada ↔ volumes via historico_volume (já funciona)
  // O problema é quando NÃO há historico_volume
  //
  // Para esse caso, a única solução seria:
  // A. Saber a fórmula encodeBar para converter vol.barra → barra_bipada
  // B. Buscar em pre_minuta com fallback para a tabela volumes direto
  //    usando id_minuta ou algum campo em comum

  // 8. Ver se a barra bipada (17 digs) pode ser derivada de vol.barra (16 digs)
  // via alguma operação simples
  // Tentativa: barra_bipada = alguma função de vol.barra
  // Já sabemos que não é anagrama nem multiplicação simples
  // Mas... e se for uma operação de bit/dígito diferente?
  
  // Buscar pares de mesma minuta e ver se parcial/total aparecem na barra bipada
  const pares = await sql`
    SELECT h.barra AS b17, v.barra AS b16, v.parcial, v.total, v.id_minuta
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE v.id_minuta = 22021
    ORDER BY v.parcial
  `;
  console.log("\nPares minuta 22021 (b17, b16, parcial, total):");
  for (const p of pares) {
    // Analisar: b17[posição_parcial] e b17[posição_total]
    const b = p.b17;
    // Extrair segmentos da barra de 17
    // Tentar interpretar como: [4][4][4][4][1]
    const seg1 = b.substring(0,4);
    const seg2 = b.substring(4,8);
    const seg3 = b.substring(8,12);
    const seg4 = b.substring(12,16);
    const dv = b[16];
    console.log(`par=${p.parcial} tot=${p.total} b16=${p.b16} b17=${p.b17}`);
    console.log(`  segs: ${seg1}|${seg2}|${seg3}|${seg4}|${dv}`);
    console.log(`  int: ${parseInt(seg1)}|${parseInt(seg2)}|${parseInt(seg3)}|${parseInt(seg4)}`);
  }

  await sql.end();
}

main().catch(console.error);
