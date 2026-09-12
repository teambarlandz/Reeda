import { getDb } from '../db';

const CAP = 50;

export const DictionaryHistoryRepository = {
  async list(): Promise<Array<{ word: string; definition: string; lookedUpAt: number }>> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM dictionary_history ORDER BY lookedUpAt DESC LIMIT ?;', [CAP]);
    return res.rows?._array ?? res.rows ?? [];
  },

  async add(word: string, definition: string): Promise<void> {
    const w = word.trim().toLowerCase();
    if (!w) return;
    const db = getDb();
    const now = Date.now();
    await db.execute('INSERT OR REPLACE INTO dictionary_history (word, definition, lookedUpAt) VALUES (?, ?, ?);', [w, definition, now]);
    await db.execute('DELETE FROM dictionary_history WHERE word NOT IN (SELECT word FROM dictionary_history ORDER BY lookedUpAt DESC LIMIT ?);', [CAP]);
  },

  async clear(): Promise<void> {
    const db = getDb();
    await db.execute('DELETE FROM dictionary_history;');
  },
};
