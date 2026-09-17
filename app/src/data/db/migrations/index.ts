import { MIGRATION_001 } from './001_initial';
import { MIGRATION_002 } from './002_fts';

type Db = {
  execute: (sql: string, params?: any[]) => Promise<any>;
  executeSql?: (sql: string, params?: any[]) => Promise<any>;
};

async function execAll(db: Db, sql: string) {
  // Split on semicolons that are NOT inside BEGIN...END blocks (triggers, functions).
  const statements: string[] = [];
  let current = '';
  let depth = 0;
  for (const line of sql.split('\n')) {
    const upper = line.toUpperCase();
    if (upper.includes('BEGIN')) depth++;
    if (upper.includes('END')) depth = Math.max(0, depth - 1);
    current += line + '\n';
    if (line.trim().endsWith(';') && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
    }
  }
  if (current.trim()) statements.push(current.trim());

  for (const stmt of statements) {
    // eslint-disable-next-line no-await-in-loop
    await db.execute(`${stmt}`);
  }
}

export async function runMigrations(db: Db) {
  // Create migrations tracking table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      appliedAt INTEGER NOT NULL
    );
  `);

  const applied = await db.execute('SELECT name FROM _migrations;');
  const appliedNames = new Set((applied.rows?._array ?? applied.rows ?? []).map((r: any) => r.name));

  const migrations: Array<{ name: string; sql: string }> = [
    { name: '001_initial', sql: MIGRATION_001 },
    { name: '002_fts', sql: MIGRATION_002 },
  ];

  for (const m of migrations) {
    if (!appliedNames.has(m.name)) {
      // eslint-disable-next-line no-await-in-loop
      await execAll(db, m.sql);
      // Backfill FTS for 002 if needed
      if (m.name === '002_fts') {
        // eslint-disable-next-line no-await-in-loop
        await db.execute(`
          INSERT INTO books_fts(bookId, title, author, genre, shelfNames, fileName)
          SELECT id, title, author, '', '', originalFileName FROM books;
        `);
      }
      // eslint-disable-next-line no-await-in-loop
      await db.execute('INSERT INTO _migrations (name, appliedAt) VALUES (?, ?);', [m.name, Date.now()]);
    }
  }
}
