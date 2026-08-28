import { PrismaClient } from '@prisma/client';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const db = new PrismaClient();
const dbReadonly = postgres({
  host: process.env.READONLY_DB_HOST,
  port: parseInt(process.env.READONLY_DB_PORT || "5432", 10),
  database: process.env.READONLY_DB_NAME,
  username: process.env.READONLY_DB_USER,
  password: process.env.READONLY_DB_PASS,
  max: 1,
  onnotice: () => void 0,
});

async function main() {
  const inv = await db.inventario.findFirst({
    orderBy: { criadoEm: 'desc' },
    include: { itens: true }
  });

  if (!inv) return;
  console.log('Inventario:', inv.id, 'Data:', inv.criadoEm);

  const barcodes = inv.itens.map(i => i.codigo_barra);
  
  const minutasData = await dbReadonly`
    SELECT DISTINCT ON (h.barra) h.barra, v.id_minuta
    FROM historico_volume h
    INNER JOIN volumes v ON h.id_volume = v.id_volume
    WHERE h.barra = ANY(${barcodes})
    ORDER BY h.barra, h.id DESC
  `;

  const map = new Map(minutasData.map(d => [String(d.barra), Number(d.id_minuta)]));
  console.log('Total barcodes map found:', map.size, 'out of', barcodes.length);

  const bipadas = new Set<number>();
  const faltantes = new Set<number>();

  for (const item of inv.itens) {
    const mId = map.get(item.codigo_barra);
    if (mId) {
      if (item.status_auditoria === "FALTANTE") {
        faltantes.add(mId);
      } else {
        bipadas.add(mId);
      }
    } else {
      console.log('No minuta for barcode:', item.codigo_barra);
    }
  }

  console.log('Bipadas size:', bipadas.size, 'Bipadas:', Array.from(bipadas));
  console.log('Faltantes size:', faltantes.size, 'Faltantes:', Array.from(faltantes));
  
  const intersection = Array.from(bipadas).filter(x => faltantes.has(x));
  console.log('Intersection size:', intersection.length, 'Intersection:', intersection);
}

main().catch(console.error).finally(() => { db.$disconnect(); dbReadonly.end(); });
