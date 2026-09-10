// Análise profunda dos diffs entre barras e busca pelo algoritmo encodeBar
// 
// Observação dos diffs:
// Minuta 22021 (par=1 a 8):
// B[1] - B[0] = -24456890123355679
// B[2] - B[1] = -33456790122245679  ← parecido
// B[3] - B[2] = 7418630740951853
// B[4] - B[3] = -23466790123255679  ← parecido com B[1]-B[0]
// B[5] - B[4] = 65543209886653321
// B[6] - B[5] = -33557790122255679  ← parecido com B[2]-B[1]
// B[7] - B[6] = 26038160481203716
//
// Os diffs entre pares (par1→par2, par3→par4) são parecidos
// Os diffs entre pares ímpares→pares (par2→par3, par4→par5) são parecidos
// Parece que a barra é um hash ou cifra de bloco simples baseada em
// dígitos intercalados, com "rodízio" de alguma tabela de pesos

// Vou tentar outra abordagem: ver se a SOMA DOS DÍGITOS tem relação com parcial
const exemplos = [
  { idMin: 22021, par: 1, tot: 8, barra: "92503491369358127" },
  { idMin: 22021, par: 2, tot: 8, barra: "68046601246002448" },
  { idMin: 22021, par: 3, tot: 8, barra: "34589811123756769" },
  { idMin: 22021, par: 4, tot: 8, barra: "42008441864708622" },
  { idMin: 22021, par: 5, tot: 8, barra: "18541651741452943" },
  { idMin: 22021, par: 6, tot: 8, barra: "84084861628106264" },
  { idMin: 22021, par: 7, tot: 8, barra: "50527071505850585" },
  { idMin: 22021, par: 8, tot: 8, barra: "76565231987054301" },
  { idMin: 1759492, par: 1, tot: 12, barra: "51254442505150625" },
  { idMin: 1759492, par: 2, tot: 12, barra: "27797652482804946" },
  { idMin: 1759492, par: 3, tot: 12, barra: "93230862369558267" },
  { idMin: 1759492, par: 4, tot: 12, barra: "69773072246202588" },
  { idMin: 1756737, par: 1, tot: 3, barra: "85718577628506214" },
  { idMin: 1756737, par: 2, tot: 3, barra: "51251787505250535" },
  { idMin: 1756737, par: 3, tot: 3, barra: "27794997482904856" },
];

// Hipótese 1: dígito de verificação (último dígito)
// O último dígito das barras da minuta 22021 são: 7, 8, 9, 2, 3, 4, 5, 1
// É uma sequência quase linear! 7,8,9, aí vai para 2 (wrappou?)... na verdade:
// par 1 → DV=7
// par 2 → DV=8
// par 3 → DV=9
// par 4 → DV=2  (9+3=12 → 2?)
// par 5 → DV=3  (2+1=3?)
// par 6 → DV=4
// par 7 → DV=5
// par 8 → DV=1  (5+6=11 → 1?)
// 
// Minuta 1759492:
// par 1 → DV=5
// par 2 → DV=6
// par 3 → DV=7
// par 4 → DV=8
// SEQUENCIAL! DV = (inicial + par - 1) % 10 ?

// Minuta 1756737:
// par 1 → DV=4
// par 2 → DV=5
// par 3 → DV=6

// CONFIRMADO! O último dígito (DV) é sequencial, incrementa 1 por parcial

// Agora vamos analisar os 8 primeiros dígitos (sem o DV)
console.log("=== ANÁLISE DO DV (último dígito) ===");
const grp22021 = exemplos.filter(e => e.idMin === 22021);
for (const e of grp22021) {
  const dv = parseInt(e.barra[16]);
  console.log(`par=${e.par}: barra=${e.barra} DV=${dv}`);
}

// Agora vamos analisar os 16 dígitos da barra (sem DV)
// e comparar com a vol_barra (16 dígitos)
console.log("\n=== ANÁLISE DOS 16 DÍGITOS SEM DV ===");
for (const e of exemplos) {
  const b16 = e.barra.substring(0, 16);
  const volBarra = e.idMin.toString().padStart(8,'0') + e.par.toString().padStart(4,'0') + e.tot.toString().padStart(4,'0');
  console.log(`par=${e.par} vol=${volBarra} b16=${b16}`);
  
  // Verificar padrão de intercalação dos dígitos de vol_barra em b16
  // vol_barra: MMMMMMMMPPPPTTTT (16 dígitos)
  // b16: parece embaralhado
  
  // Hipótese: b16 é uma permutação de vol_barra?
  const volDigits = volBarra.split('').map(Number);
  const b16Digits = b16.split('').map(Number);
  
  // Verificar se são anagramas (mesmos dígitos em ordem diferente)
  const sortedVol = [...volDigits].sort().join('');
  const sortedB16 = [...b16Digits].sort().join('');
  const ehAnagrama = sortedVol === sortedB16;
  console.log(`  anagrama=${ehAnagrama} sortedVol=${sortedVol} sortedB16=${sortedB16}`);
}

// Hipótese: cada dígito do vol_barra é multiplicado por um peso e reduzido a 1 dígito
// Como numa cifra de substituição/transposição
// Vamos tentar: para cada posição i do vol_barra, calcular (dig * peso) % 10
// e ver qual peso faz vol_barra[0] = b16[posição]

console.log("\n=== ANÁLISE DE SUBSTITUIÇÃO DIGIT BY DIGIT ===");
const e0 = exemplos[0]; // minuta 22021, par=1
const vol0 = e0.idMin.toString().padStart(8,'0') + e0.par.toString().padStart(4,'0') + e0.tot.toString().padStart(4,'0');
const b16_0 = e0.barra.substring(0, 16);
console.log(`vol=${vol0}`);
console.log(`b16=${b16_0}`);
console.log("vol_dig→b16_dig (mesma posição):");
for (let i = 0; i < 16; i++) {
  const vd = parseInt(vol0[i]);
  const bd = parseInt(b16_0[i]);
  // Qual multiplicador k faz (vd * k) % 10 = bd?
  const pesos = [];
  for (let k = 1; k <= 9; k++) {
    if ((vd * k) % 10 === bd) pesos.push(k);
  }
  console.log(`  pos=${i}: vol[${i}]=${vd} b16[${i}]=${bd} pesos_possíveis=${JSON.stringify(pesos)}`);
}

// Tentar outra abordagem: ver se a barra de 17 é derivada 
// do vol_barra usando uma tabela de lookup ou uma fórmula com pesos diferentes por posição
// 
// Baseando na estrutura vista:
// vol_barra: MMMMMMMMPPPPTTTT (posições 0-15)
// barra: XXXXXXXXXXXXXXXXX (posições 0-16, última é DV)
//
// Vamos ver se os dígitos do vol_barra aparecem na barra17 em posições diferentes
console.log("\n=== PERMUTAÇÃO DE POSIÇÕES ===");
for (const e of exemplos.slice(0, 4)) {
  const volBarra = e.idMin.toString().padStart(8,'0') + e.par.toString().padStart(4,'0') + e.tot.toString().padStart(4,'0');
  const b16 = e.barra.substring(0, 16);
  
  // Para cada posição j em vol_barra, qual posição no b16 ela aparece?
  const mapeamento = [];
  for (let i = 0; i < 16; i++) {
    // Procura vol_barra[i] em b16
    const vd = vol0[i];
    let found = -1;
    for (let j = 0; j < 16; j++) {
      if (b16[j] === vd) {
        found = j;
        break;
      }
    }
    mapeamento.push(`${i}→${found}`);
  }
  console.log(`par=${e.par}: ${mapeamento.join(', ')}`);
}
