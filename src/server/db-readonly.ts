/**
 * Conexão somente leitura com o banco legado `torre_controle`.
 *
 * Use esta instância (`dbReadonly`) para realizar consultas SQL puras
 * contra o banco de dados legado. Nunca use para escrita.
 *
 * Exemplo de uso em um tRPC router ou Server Action:
 *
 *   import { dbReadonly } from "@/server/db-readonly";
 *
 *   const rows = await dbReadonly`
 *     SELECT * FROM equipamentos WHERE ativo = true LIMIT 10
 *   `;
 */

import "server-only";
import postgres from "postgres";
import { env } from "@/env";

/**
 * Cria uma nova instância de conexão com o banco legado.
 * Configurada como somente leitura (read_only = true) e com
 * keep-alive habilitado para reutilização eficiente de conexões.
 */
const createReadonlyClient = () =>
  postgres({
    host: env.READONLY_DB_HOST,
    port: parseInt(env.READONLY_DB_PORT, 10),
    database: env.READONLY_DB_NAME,
    username: env.READONLY_DB_USER,
    password: env.READONLY_DB_PASS,
    max: 5,           // pool máximo de 5 conexões (banco legado)
    idle_timeout: 30, // fecha conexões ociosas após 30s
    connect_timeout: 10,
    onnotice: () => void 0, // silencia NOTICEs do PostgreSQL
  });

// Singleton global para evitar múltiplas pools em desenvolvimento (hot-reload)
const globalForReadonly = globalThis as unknown as {
  dbReadonly: ReturnType<typeof createReadonlyClient> | undefined;
};

export const dbReadonly =
  globalForReadonly.dbReadonly ?? createReadonlyClient();

if (env.NODE_ENV !== "production") {
  globalForReadonly.dbReadonly = dbReadonly;
}
