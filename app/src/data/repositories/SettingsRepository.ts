import { getDb } from '../db';

export const SettingsRepository = {
  async get(key: string): Promise<string | null> {
    try {
      const db = getDb();
      const res: any = await db.execute('SELECT value FROM settings WHERE key = ? LIMIT 1;', [key]);
      const rows = res.rows?._array ?? res.rows ?? [];
      return rows[0]?.value ?? null;
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      const db = getDb();
      await db.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);', [key, String(value)]);
    } catch {}
  },
  async getJson<T>(key: string, fallback: T): Promise<T> {
    const v = await SettingsRepository.get(key);
    if (v == null) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  },
  async setJson(key: string, value: unknown): Promise<void> {
    await SettingsRepository.set(key, JSON.stringify(value));
  },
};
