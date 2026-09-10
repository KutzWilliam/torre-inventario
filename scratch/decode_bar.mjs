// Análise matemática profunda do encodeBar
// vol_barra = MMMMMMMMPPPPTTTT (id_minuta=8, parcial=4, total=4) = 16 digs
// barra_bipada = 17 dígitos
// 
// Exemplos (mesma minuta 1759492):
// parcial=1/12 → vol=0175949200010012 | barra=51254442505150625
// parcial=2/12 → vol=0175949200020012 | barra=27797652482804946
// parcial=3/12 → vol=0175949200030012 | barra=93230862369558267
// parcial=4/12 → vol=0175949200040012 | barra=69773072246202588

// Vamos ver os dígitos posicionalmente
const exemplos = [
  { idMin: 1759492, par: 1, tot: 12, barra: "51254442505150625" },
  { idMin: 1759492, par: 2, tot: 12, barra: "27797652482804946" },
  { idMin: 1759492, par: 3, tot: 12, barra: "93230862369558267" },
  { idMin: 1759492, par: 4, tot: 12, barra: "69773072246202588" },
  // Minuta 1756737, total=3:
  { idMin: 1756737, par: 1, tot: 3, barra: "85718577628506214" },
  { idMin: 1756737, par: 2, tot: 3, barra: "51251787505250535" },
  { idMin: 1756737, par: 3, tot: 3, barra: "27794997482904856" },
  // Minuta 1756587, total=8
  { idMin: 1756587, par: 1, tot: 8, barra: "19275117741952943" },
  // Minuta 1754970, total=3
  { idMin: 1754970, par: 1, tot: 3, barra: "77297180987754351" },
  { idMin: 1754970, par: 3, tot: 3, barra: "19273500741152993" },
  // Minuta 1757033, total=1
  { idMin: 1757033, par: 1, tot: 1, barra: "77290243987754331" },
  // Minuta 22021, total=8
  { idMin: 22021, par: 1, tot: 8, barra: "92503491369358127" },
  { idMin: 22021, par: 2, tot: 8, barra: "68046601246002448" },
  { idMin: 22021, par: 3, tot: 8, barra: "34589811123756769" },
  { idMin: 22021, par: 4, tot: 8, barra: "42008441864708622" },
  { idMin: 22021, par: 5, tot: 8, barra: "18541651741452943" },
  { idMin: 22021, par: 6, tot: 8, barra: "84084861628106264" },
  { idMin: 22021, par: 7, tot: 8, barra: "50527071505850585" },
  { idMin: 22021, par: 8, tot: 8, barra: "76565231987054301" },
];

// Hipótese: a barra de 17 dígitos é derivada de vol_barra (16 digs)
// por alguma transformação. O MySQL tinha encodeBar(barras) → 17 digs
//
// OBSERVAÇÃO IMPORTANTE: olhando os dígitos da barra de 17:
// Minuta 1759492, par=1: 51254442505150625
// A barra parece ter padrões numéricos que se repetem em posições
// Por exemplo, dígitos alternados?
// 5-1-2-5-4-4-4-2-5-0-5-1-5-0-6-2-5
//
// Vamos tentar outra abordagem: a barra de 16 dígitos no formato MMPPTT
// Então a barra de 17 = encodeBar(MMPPTT) onde MM=minuta, PP=parcial, TT=total
//
// Vamos analisar se é uma codificação posicional dos dígitos

function decodePosPossivel(barra17) {
  // Hipótese: posições [0,2,4,6] = dígitos da minuta ?
  const b = barra17;
  const pares0246 = b[0]+b[2]+b[4]+b[6]+b[8]+b[10]+b[12]+b[14]; // 8 dígitos = minuta?
  const impares = b[1]+b[3]+b[5]+b[7]+b[9]+b[11]+b[13]+b[15]; // 8 dígitos
  return { pares0246, impares, ultimo: b[16] };
}

console.log("=== ANÁLISE POSICIONAL ===\n");
for (const ex of exemplos) {
  const volBarra = ex.idMin.toString().padStart(8,'0') + ex.par.toString().padStart(4,'0') + ex.tot.toString().padStart(4,'0');
  const dec = decodePosPossivel(ex.barra);
  console.log(`minuta=${ex.idMin} par=${ex.par} tot=${ex.tot}`);
  console.log(`  vol_barra=${volBarra}`);
  console.log(`  barra17=${ex.barra}`);
  console.log(`  pares(0,2,4,6,8,10,12,14)=${dec.pares0246} impares=${dec.impares} DV=${dec.ultimo}`);
}

// Tentar outra hipótese: os dígitos pares/ímpares intercalam minuta e parcial/total
// vol_barra = MMMMMMMMPPPPTTTT
// barra17 intercalado?
console.log("\n=== TENTATIVA DE INTERCALAÇÃO ===");
for (const ex of exemplos) {
  const b = ex.barra;
  // Desinterlaçar: pares e ímpares
  let pares = "", impares = "";
  for (let i = 0; i < 16; i++) {
    if (i % 2 === 0) pares += b[i];
    else impares += b[i];
  }
  console.log(`minuta=${ex.idMin} par=${ex.par} tot=${ex.tot} barra=${ex.barra}`);
  console.log(`  Dígitos pares (0,2,4...14)=${pares} ímpares(1,3,5...15)=${impares} DV=${b[16]}`);
  console.log(`  int(pares)=${parseInt(pares)} int(impares)=${parseInt(impares)}`);
  
  // Verificar se pares ou impares correspondem a alguma das 3 partes
  const minStr = ex.idMin.toString();
  const parStr = ex.par.toString();
  const totStr = ex.tot.toString();
  
  if (pares.includes(minStr) || impares.includes(minStr)) {
    console.log(`  *** MINUTA ENCONTRADA como substring ***`);
  }
}

// Vamos tentar outra abordagem: a barra de 17 pode ser um EAN-17 ou Code 128
// com algum algoritmo de checksum ou scrambling
// Olhando padrões entre barras da MESMA minuta (que diferem apenas no parcial):
console.log("\n=== DIFF ENTRE BARRAS DA MESMA MINUTA ===");
const grp1 = exemplos.filter(e => e.idMin === 1759492);
for (const e of grp1) {
  console.log(`par=${e.par}: ${e.barra}`);
}
// Calculando diferenças entre as barras
const barras1 = grp1.map(e => BigInt(e.barra));
console.log("Diffs entre barras consecutivas:");
for (let i = 1; i < barras1.length; i++) {
  console.log(`  B[${i}] - B[${i-1}] = ${barras1[i] - barras1[i-1]}`);
}

// Minuta 22021
const grp2 = exemplos.filter(e => e.idMin === 22021);
console.log("\nMinuta 22021:");
for (const e of grp2) {
  console.log(`par=${e.par}: ${e.barra}`);
}
const barras2 = grp2.map(e => BigInt(e.barra));
console.log("Diffs entre barras consecutivas:");
for (let i = 1; i < barras2.length; i++) {
  console.log(`  B[${i}] - B[${i-1}] = ${barras2[i] - barras2[i-1]}`);
}
