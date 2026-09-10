// Análise mais focada: 
// vol_barra = MMMMMMMMPPPPTTTT (16 dígitos, gerado pelo sistema)
// barra_bipada = 17 dígitos (lida pelo scanner na etiqueta física)
//
// Hipótese nova: a barra de 17 não é derivada de vol_barra por transformação direta.
// Ao invés disso, pode ser um código de barras padrão (Code128, EAN, etc.)
// impresso na etiqueta e gerado com a MESMA informação mas em formato diferente.
//
// Observação crítica sobre DV (último dígito):
// Minuta 22021: par=1→DV=7, par=2→DV=8, par=3→DV=9, par=4→DV=2, par=5→DV=3
// Os DVs estão incrementando 1 a cada parcial EXCETO quando passa de 9 para 2.
// Isso sugere que o DV NÃO é simplesmente parcial % 10.
// 
// NOVA HIPÓTESE: A barra de 17 é composta por:
// [8 dígitos aleatórios/hash] + [4 dígitos do parcial codificado] + [4 dígitos do total codificado] + [DV]
//
// OU: a barra é: val1(4dig) + val2(4dig) + val3(4dig) + val4(4dig) + DV
// Onde val1..val4 são transformações de id_minuta, parcial, total

// Vamos tentar ver padrões na estrutura 4+4+4+4+1 (= 17 dígitos)
const exemplos = [
  { idMin: 22021, par: 1, tot: 8, barra: "92503491369358127" },
  { idMin: 22021, par: 2, tot: 8, barra: "68046601246002448" },
  { idMin: 22021, par: 3, tot: 8, barra: "34589811123756769" },
  { idMin: 22021, par: 4, tot: 8, barra: "42008441864708622" },
  { idMin: 22021, par: 5, tot: 8, barra: "18541651741452943" },
  { idMin: 22021, par: 6, tot: 8, barra: "84084861628106264" },
  { idMin: 22021, par: 7, tot: 8, barra: "50527071505850585" },
  { idMin: 22021, par: 8, tot: 8, barra: "76565231987054301" },
];

console.log("=== ESTRUTURA 4+4+4+4+1 ===");
for (const e of exemplos) {
  const g1 = parseInt(e.barra.substring(0,4));
  const g2 = parseInt(e.barra.substring(4,8));
  const g3 = parseInt(e.barra.substring(8,12));
  const g4 = parseInt(e.barra.substring(12,16));
  const dv = parseInt(e.barra[16]);
  const soma = g1+g2+g3+g4;
  console.log(`par=${e.par} g1=${g1} g2=${g2} g3=${g3} g4=${g4} DV=${dv} soma=${soma} soma%10=${soma%10}`);
}

// Tentando estrutura 5+4+4+4 ou outras
console.log("\n=== ESTRUTURA 5+4+4+4 ===");
for (const e of exemplos) {
  const g1 = parseInt(e.barra.substring(0,5));
  const g2 = parseInt(e.barra.substring(5,9));
  const g3 = parseInt(e.barra.substring(9,13));
  const g4 = parseInt(e.barra.substring(13,17));
  console.log(`par=${e.par} g1=${g1} g2=${g2} g3=${g3} g4=${g4}`);
}

// Análise: a soma dos 4 grupos de 4 dígitos tem relação com DV?
console.log("\n=== VERIFICAÇÃO DV via SOMA GRUPOS ===");
for (const e of exemplos) {
  const g1 = parseInt(e.barra.substring(0,4));
  const g2 = parseInt(e.barra.substring(4,8));
  const g3 = parseInt(e.barra.substring(8,12));
  const g4 = parseInt(e.barra.substring(12,16));
  const dv = parseInt(e.barra[16]);
  
  // Tentar: (g1 + g2 + g3 + g4) % 10 == DV ?
  const soma4 = (g1+g2+g3+g4) % 10;
  // Tentar: soma dígitos individuais
  const somaDig = e.barra.substring(0,16).split('').reduce((a,b) => a + parseInt(b), 0);
  const somaDig10 = somaDig % 10;
  // EAN verificador: alternando peso 1 e 3
  let ean = 0;
  for (let i = 0; i < 16; i++) {
    ean += parseInt(e.barra[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const dvEan = (10 - (ean % 10)) % 10;
  
  console.log(`par=${e.par} DV=${dv} | soma%10=${soma4} | somaDig%10=${somaDig10} | EAN_DV(3,1)=${dvEan}`);
}

// Testar EAN com pesos invertidos (1 e 3 alternados)
console.log("\n=== EAN COM PESOS (1,3) ===");
for (const e of exemplos) {
  let ean = 0;
  for (let i = 0; i < 16; i++) {
    ean += parseInt(e.barra[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const dvEan = (10 - (ean % 10)) % 10;
  const dv = parseInt(e.barra[16]);
  console.log(`par=${e.par} DV_real=${dv} DV_EAN(1,3)=${dvEan} match=${dvEan===dv}`);
}

// Testar com múltiplos pesos
console.log("\n=== BUSCA DE PESOS PARA DV ===");
const ex1 = exemplos[0];
// Tentar combinações de pesos simples para os 16 dígitos
// pesos[i] * barra[i], somado e % 10 = DV
console.log(`Exemplo: barra=${ex1.barra} DV=${ex1.barra[16]}`);
const dvAlvo = parseInt(ex1.barra[16]);
// Tentar pesos de 1 a 9 em posições alternadas
for (const p1 of [1,2,3,4,5,6,7,8,9]) {
  for (const p2 of [1,2,3,4,5,6,7,8,9]) {
    let soma = 0;
    for (let i = 0; i < 16; i++) {
      soma += parseInt(ex1.barra[i]) * (i % 2 === 0 ? p1 : p2);
    }
    const dvCalc = (10 - (soma % 10)) % 10;
    if (dvCalc === dvAlvo) {
      // Verificar nos outros exemplos
      let ok = true;
      for (const ex of exemplos.slice(1)) {
        let s2 = 0;
        for (let i = 0; i < 16; i++) s2 += parseInt(ex.barra[i]) * (i % 2 === 0 ? p1 : p2);
        if ((10 - (s2 % 10)) % 10 !== parseInt(ex.barra[16])) { ok = false; break; }
      }
      if (ok) console.log(`MATCH PERFEITO! pesos alternados: par=${p1}, impar=${p2}`);
    }
  }
}

// Tentar também: soma simples % 10 de alguma parte
console.log("\n=== DIVISÃO DA BARRA EM PARTES E DV ===");
// Observando os DVs: 7, 8, 9, 2, 3, 4, 5, 1 para par 1..8
// Notamos que incrementa 1, mas wrapping é diferente de 10
// De 9 → 2 (pula 10,11=1? não)
// De 1 (par8) → ?
// Talvez o DV não seja baseado em parcial mas seja calculado a partir dos outros 16 dígitos
// com alguma fórmula de checksum específica do sistema

// Tentar: soma de todos dígitos (exceto DV) % 10, mas com DV = complemento para múltiplo de 10
// ou % algum número primo
for (const mod of [7, 11, 13, 17, 23]) {
  let allMatch = true;
  for (const e of exemplos) {
    const soma = e.barra.substring(0,16).split('').reduce((a,b) => a + parseInt(b), 0);
    const dvCalc = soma % mod;
    if (dvCalc !== parseInt(e.barra[16])) { allMatch = false; break; }
  }
  if (allMatch) console.log(`DV = soma_digitos % ${mod} → MATCH PERFEITO!`);
}

// Verificar se o DV é simples soma dos dígitos
for (const e of exemplos) {
  const soma = e.barra.substring(0,16).split('').reduce((a,b) => a + parseInt(b), 0);
  const dv = parseInt(e.barra[16]);
  console.log(`par=${e.par} soma_16digs=${soma} DV=${dv} soma%10=${soma%10} (10-soma%10)%10=${(10-soma%10)%10}`);
}
