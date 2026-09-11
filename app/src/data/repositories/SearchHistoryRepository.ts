import { getDb } from '../db';

const CAP = 10;

export const SearchHistoryRepository = {
  async list(): Promise<string[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT query FROM search_history ORDER BY searchedAt DESC LIMIT ?;', [CAP]);
    const rows = res.rows?._array ?? res.rows ?? [];
    return rows.map((r: any) => r.query);
  },

  async add(query: string) {
    const q = query.trim();
    if (!q) return;
    const db = getDb();
    const now = Date.now();
    await db.execute('INSERT OR REPLACE INTO search_history (query, searchedAt) VALUES (?, ?);', [q, now]);
    // Evict oldest beyond CAP
    await db.execute(
      `DELETE FROM search_history WHERE query NOT IN (SELECT query FROM search_history ORDER BY searchedAt DESC LIMIT ?);`,
      [CAP],
    );
  },

  async clear() {
    const db = getDb();
    await db.execute('DELETE FROM search_history;');
  },
};
