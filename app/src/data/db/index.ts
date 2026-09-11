import { open } from 'react-native-quick-sqlite';

let db: ReturnType<typeof open> | null = null;
let initialized = false;

export function getDb() {
  if (!db) {
    db = open({ name: 'reeda.db', location: 'default' });
  }
  return db;
}

export async function initDb() {
  if (initialized) return getDb();
  const database = getDb();
  // Enable WAL to prevent database is locked during read+write per phase-2.md:5.1.1
  database.execute('PRAGMA journal_mode=WAL;');
  database.execute('PRAGMA foreign_keys=ON;');
  // Run migrations sequentially
  const { runMigrations } = await import('./migrations');
  await runMigrations(database as any);
  initialized = true;
  return database;
}

export function resetDbForTests() {
  initialized = false;
  db = null;
}
