import { getDb } from '../db';

export type Highlight = {
  id: string;
  bookId: string;
  page?: number;
  chapterId?: string;
  text: string;
  color: string; // one of 6 per phase-3-reader.md:2.4 Item 3
  rangeStart?: number;
  rangeEnd?: number;
  createdAt: number;
};

export const HIGHLIGHT_COLORS = ['#FFEB3B', '#4CAF50', '#2196F3', '#E91E63', '#FF9800', '#9C27B0'] as const;

export const HighlightRepository = {
  async list(bookId: string): Promise<Highlight[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM highlights WHERE bookId = ? ORDER BY createdAt DESC;', [bookId]);
    return res.rows?._array ?? res.rows ?? [];
  },

  async listAll(): Promise<Highlight[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM highlights ORDER BY createdAt DESC;');
    return res.rows?._array ?? res.rows ?? [];
  },

  async create(h: Omit<Highlight, 'id' | 'createdAt'> & { id?: string }): Promise<string> {
    const db = getDb();
    const id = h.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    await db.execute(
      'INSERT INTO highlights (id, bookId, page, chapterId, text, color, rangeStart, rangeEnd, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [id, h.bookId, h.page ?? null, h.chapterId ?? null, h.text, h.color, h.rangeStart ?? null, h.rangeEnd ?? null, now],
    );
    return id;
  },

  async updateColor(id: string, color: string): Promise<void> {
    const db = getDb();
    await db.execute('UPDATE highlights SET color = ? WHERE id = ?;', [color, id]);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.execute('DELETE FROM highlights WHERE id = ?;', [id]);
  },
};
