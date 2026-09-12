import { getDb } from '../db';

export const ReadingSessionsRepository = {
  async start(bookId: string): Promise<string> {
    const db = getDb();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await db.execute(
      'INSERT INTO reading_sessions (id, bookId, startedAt, durationMs, pagesRead) VALUES (?, ?, ?, ?, ?);',
      [id, bookId, Date.now(), 0, 0],
    );
    return id;
  },

  async end(sessionId: string, pagesRead = 0): Promise<void> {
    const db = getDb();
    const now = Date.now();
    const res: any = await db.execute('SELECT startedAt FROM reading_sessions WHERE id = ?;', [sessionId]);
    const rows = res.rows?._array ?? res.rows ?? [];
    const startedAt = rows[0]?.startedAt ?? now;
    const durationMs = now - startedAt;
    await db.execute('UPDATE reading_sessions SET endedAt = ?, durationMs = ?, pagesRead = ? WHERE id = ?;', [now, durationMs, pagesRead, sessionId]);
  },

  async todayMinutes(): Promise<number> {
    const db = getDb();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const res: any = await db.execute('SELECT durationMs FROM reading_sessions WHERE startedAt >= ? AND endedAt IS NOT NULL;', [startOfDay.getTime()]);
    const rows = res.rows?._array ?? res.rows ?? [];
    const total = rows.reduce((sum: number, r: any) => sum + (r.durationMs ?? 0), 0);
    return Math.floor(total / 60000);
  },

  async totalMinutes(): Promise<number> {
    const db = getDb();
    const res: any = await db.execute('SELECT durationMs FROM reading_sessions WHERE endedAt IS NOT NULL;');
    const rows = res.rows?._array ?? res.rows ?? [];
    const total = rows.reduce((sum: number, r: any) => sum + (r.durationMs ?? 0), 0);
    return Math.floor(total / 60000);
  },

  async getStreak(): Promise<number> {
    const db = getDb();
    const res: any = await db.execute('SELECT startedAt FROM reading_sessions WHERE endedAt IS NOT NULL ORDER BY startedAt DESC;');
    const rows: any[] = res.rows?._array ?? res.rows ?? [];
    if (rows.length === 0) return 0;
    const days = new Set<string>();
    rows.forEach(r => {
      const d = new Date(r.startedAt);
      d.setHours(0, 0, 0, 0);
      days.add(String(d.getTime()));
    });
    const sorted = Array.from(days).map(Number).sort((a, b) => b - a);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let streak = 0;
    let cursor = today.getTime();
    // Allow streak to start yesterday if today has no session yet (common)
    if (!days.has(String(cursor))) cursor -= 86400000;
    while (days.has(String(cursor))) {
      streak += 1;
      cursor -= 86400000;
    }
    return streak;
  },

  async getLast7Days(): Promise<number[]> {
    const db = getDb();
    const days: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 86400000;
      const res: any = await db.execute('SELECT durationMs FROM reading_sessions WHERE startedAt >= ? AND startedAt < ? AND endedAt IS NOT NULL;', [start, end]);
      const rows: any[] = res.rows?._array ?? res.rows ?? [];
      const total = rows.reduce((s: number, r: any) => s + (r.durationMs ?? 0), 0);
      days.push(Math.floor(total / 60000));
    }
    return days;
  },

  async getDaysReading(): Promise<number> {
    const db = getDb();
    const res: any = await db.execute('SELECT startedAt FROM reading_sessions WHERE endedAt IS NOT NULL;');
    const rows: any[] = res.rows?._array ?? res.rows ?? [];
    const set = new Set<string>();
    rows.forEach(r => {
      const d = new Date(r.startedAt);
      d.setHours(0, 0, 0, 0);
      set.add(String(d.getTime()));
    });
    return set.size;
  },
};
