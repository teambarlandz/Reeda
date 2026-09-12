import { getDb } from '../db';

export type Note = {
  id: string;
  bookId: string;
  highlightId?: string;
  page?: number;
  chapterId?: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

export const NoteRepository = {
  async list(bookId: string): Promise<Note[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM notes WHERE bookId = ? ORDER BY updatedAt DESC;', [bookId]);
    return res.rows?._array ?? res.rows ?? [];
  },

  async listAll(): Promise<Note[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM notes ORDER BY updatedAt DESC;');
    return res.rows?._array ?? res.rows ?? [];
  },

  async create(n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    const db = getDb();
    const id = n.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    await db.execute(
      'INSERT INTO notes (id, bookId, highlightId, page, chapterId, text, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [id, n.bookId, n.highlightId ?? null, n.page ?? null, n.chapterId ?? null, n.text, now, now],
    );
    return id;
  },

  async update(id: string, text: string): Promise<void> {
    const db = getDb();
    await db.execute('UPDATE notes SET text = ?, updatedAt = ? WHERE id = ?;', [text, Date.now(), id]);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.execute('DELETE FROM notes WHERE id = ?;', [id]);
  },
};
