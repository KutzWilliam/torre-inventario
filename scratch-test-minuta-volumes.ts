import { db } from './src/server/db.js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
    WHERE h.barra::text = ANY(${barcodes})
    ORDER BY h.barra, h.id DESC
  `;

  const map = new Map(minutasData.map(d => [String(d.barra).trim(), Number(d.id_minuta)]));
  
  const bipadas = new Set<number>();
  const faltantes = new Set<number>();

  for (const item of inv.itens) {
    const mId = map.get(item.codigo_barra.trim());
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

  const intersection = Array.from(bipadas).filter(x => faltantes.has(x));
  console.log('Intersection size:', intersection.length);
}

main().catch(console.error).finally(() => { dbReadonly.end(); });
