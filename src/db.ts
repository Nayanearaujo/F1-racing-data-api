import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(__dirname, '..', 'data', 'processed', 'f1_database.sqlite');

if (!fs.existsSync(DB_PATH)) {
  console.warn(`[AVISO] Banco de dados não encontrado em: ${DB_PATH}. Certifique-se de rodar 'npm run etl:transform'.`);
}

export const db = new Database(DB_PATH, {
  readonly: true,
  fileMustExist: false
});

// Habilita otimizações de leitura
db.pragma('journal_mode = WAL');

export function createResponse<T>(data: T, total?: number) {
  return {
    status: 'success' as const,
    total: total !== undefined ? total : (Array.isArray(data) ? data.length : 1),
    data,
    meta: {
      fonte: 'Ergast Developer API / Jolpica F1 Mirror (F1 Official Data)',
      timestamp: new Date().toISOString(),
      versao: '1.0.0'
    }
  };
}
