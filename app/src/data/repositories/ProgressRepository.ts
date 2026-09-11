import { getDb } from '../db';

export const ProgressRepository = {
  async getProgress(bookId: string) {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM reading_progress WHERE bookId = ?;', [bookId]);
    const rows = res.rows?._array ?? res.rows ?? [];
    return rows[0] ?? null;
  },

  async updatePosition(bookId: string, pos: { currentPage?: number; progressPercent?: number; lastPosition?: string }) {
    const db = getDb();
    const now = Date.now();
    await db.execute(
      `INSERT INTO reading_progress (bookId, currentPage, progressPercent, lastPosition, updatedAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(bookId) DO UPDATE SET currentPage=excluded.currentPage, progressPercent=excluded.progressPercent, lastPosition=excluded.lastPosition, updatedAt=excluded.updatedAt;`,
      [bookId, pos.currentPage ?? 0, pos.progressPercent ?? 0, pos.lastPosition ?? null, now],
    );
  },
};
