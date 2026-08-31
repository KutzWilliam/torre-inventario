const { PrismaClient } = require('@prisma/client');
const postgres = require('postgres');

const prisma = new PrismaClient();
const sql = postgres(process.env.LEGACY_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/princesa');

async function run() {
  const inv = await prisma.inventario.findFirst({
    where: { status: 'CONCLUIDO' },
    include: { itens: true },
    orderBy: { criadoEm: 'desc' }
  });
  
  console.log('Inv ID:', inv.id, 'Total itens:', inv.itens.length);
  
  const FALTANTES = inv.itens.filter(i => i.status_auditoria === 'FALTANTE');
  const LIDOS = inv.itens.filter(i => i.status_auditoria !== 'FALTANTE');
  console.log('Faltantes:', FALTANTES.length, 'Lidos:', LIDOS.length);
  
  const allBarcodes = inv.itens.map(i => i.codigo_barra);
  
  const rows = await sql`
     SELECT DISTINCT ON (h.barra) h.barra, v.id_minuta
     FROM historico_volume h
     INNER JOIN volumes v ON h.id_volume = v.id_volume
     WHERE h.barra = ANY(${allBarcodes})
     ORDER BY h.barra, h.id DESC`;
  
  const barcodeMap = new Map(rows.map(r => [String(r.barra), Number(r.id_minuta)]));
  
  const minutasBipadas = new Set();
  const minutasFaltantes = new Set();
  
  for (const item of inv.itens) {
    const mId = barcodeMap.get(String(item.codigo_barra));
    if (!mId) continue;
    if (item.status_auditoria === 'FALTANTE') minutasFaltantes.add(mId);
    else minutasBipadas.add(mId);
  }
  
  console.log('Minutas Bipadas:', Array.from(minutasBipadas));
  console.log('Minutas Faltantes:', Array.from(minutasFaltantes));
  
  let divergencias = 0;
  for (const mId of minutasBipadas) {
    if (minutasFaltantes.has(mId)) divergencias++;
  }
  console.log('Divergencias (intersection):', divergencias);
  
  process.exit();
}
run();
