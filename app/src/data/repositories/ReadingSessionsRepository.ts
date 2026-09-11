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
    // Also update reading_progress timeSpentMs
    const progRes: any = await db.execute('SELECT timeSpentMs FROM reading_progress WHERE bookId = (SELECT bookId FROM reading_sessions WHERE id = ?);', [sessionId]);
    const progRows = progRes.rows?._array ?? progRes.rows ?? [];
    // Updated via ProgressRepository
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
};
