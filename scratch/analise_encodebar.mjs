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

// Análise do padrão encodeBar
// volumes.barra formato: id_minuta(8dig) + parcial(4dig) + total(4dig) = 16 dígitos
// barra_bipada: 17 dígitos

function analisarPadrao(volBarra, barraBipada) {
  // volumes.barra = "MMMMMMMMPPPPTTTT" (16 chars)
  const idMin = parseInt(volBarra.substring(0, 8));
  const parcial = parseInt(volBarra.substring(8, 12));
  const total = parseInt(volBarra.substring(12, 16));
  
  console.log(`  vol_barra=${volBarra} → id_minuta=${idMin}, parcial=${parcial}, total=${total}`);
  console.log(`  barra_bipada=${barraBipada} (${barraBipada.length} digs)`);
  
  // Decompor barra bipada de 17 dígitos
  // Ver se algum segmento numérico aparece
  const b = barraBipada;
  console.log(`  Dígitos barra: ${b}`);
  console.log(`  Chars [0-8]: ${b.substring(0,8)} | [8-12]: ${b.substring(8,12)} | [12-16]: ${b.substring(12,16)} | [16]: ${b[16]}`);
  
  // Verificar se parcial/total aparecem em alguma posição
  const parStr = parcial.toString().padStart(4, '0');
  const totStr = total.toString().padStart(4, '0');
  const minStr = idMin.toString().padStart(8, '0');
  
  console.log(`  Buscando parcial=${parStr} em barra: posição=${b.indexOf(parStr)}`);
  console.log(`  Buscando total=${totStr} em barra: posição=${b.indexOf(totStr)}`);
  console.log(`  Buscando minuta=${minStr} em barra: posição=${b.indexOf(minStr)}`);
  console.log('');
}

async function main() {
  console.log("=== ANÁLISE DO PADRÃO encodeBar ===\n");
  
  // Buscar pares vol_barra + barra_bipada
  const pares = await sql`
    SELECT
      v.barra AS vol_barra,
      h.barra AS barra_bipada,
      v.id_minuta,
      v.parcial,
      v.total
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE LENGTH(h.barra::text) = 17
      AND LENGTH(v.barra) = 16
      AND v.barra IS NOT NULL
    ORDER BY h.id DESC
    LIMIT 30
  `;
  
  console.log(`Total pares encontrados: ${pares.length}\n`);
  
  for (const p of pares) {
    analisarPadrao(p.vol_barra, p.barra_bipada);
  }
  
  // Agora vamos tentar a análise reversa:
  // A barra de 17 dígitos é um código EAN/Code128?
  // Vamos ver se é possível derivar vol_barra a partir da barra_bipada
  console.log("\n=== ANÁLISE REVERSA: da barra_bipada para vol_barra ===");
  const p = pares[0];
  if (p) {
    const barra = p.barra_bipada;
    const vol = p.vol_barra;
    console.log(`Exemplo: barra_bipada=${barra}, vol_barra=${vol}`);
    console.log(`id_minuta=${p.id_minuta}, parcial=${p.parcial}, total=${p.total}`);
    
    // Barra 17 dígitos - pode ser que tenha dígito verificador no final
    // Ou pode ser que siga um padrão diferente
    // Vamos ver os primeiros dígitos de várias barras da mesma minuta
    const mesmaMinuta = pares.filter(x => x.id_minuta === p.id_minuta);
    console.log(`\nBarras da mesma minuta (id=${p.id_minuta}):`);
    for (const x of mesmaMinuta) {
      console.log(`  parcial=${x.parcial}/${x.total} | vol_barra=${x.vol_barra} | barra_bipada=${x.barra_bipada}`);
    }
  }
  
  // Análise dos grupos de dígitos
  // Formato suspeito: a barra de 17 tem 3 grupos?
  // Exemplo: 69773072246202588
  // Se dividirmos em grupos de valores possíveis...
  console.log("\n=== GRUPOS DE DÍGITOS NAS BARRAS DE 17 ===");
  for (const p of pares.slice(0, 10)) {
    const b = p.barra_bipada;
    // Tentar: [d1][d2][d3][d4][d5][d6][d7][d8][d9][d10][d11][d12][d13][d14][d15][d16][dv]
    // Ou: [id_minuta_codificado][parcial_codificado][total_codificado][dv]
    console.log(`barra=${b} → ${b.split('').join('-')}`);
  }
  
  await sql.end();
}

main().catch(console.error);
