import { getDb } from '../db';

export type Bookmark = {
  id: string;
  bookId: string;
  page: number;
  chapterId?: string;
  snippet?: string;
  createdAt: number;
};

export const BookmarkRepository = {
  async list(bookId: string): Promise<Bookmark[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM bookmarks WHERE bookId = ? ORDER BY page ASC;', [bookId]);
    return res.rows?._array ?? res.rows ?? [];
  },

  async isBookmarked(bookId: string, page: number): Promise<boolean> {
    const db = getDb();
    const res: any = await db.execute('SELECT id FROM bookmarks WHERE bookId = ? AND page = ?;', [bookId, page]);
    const rows = res.rows?._array ?? res.rows ?? [];
    return rows.length > 0;
  },

  async toggle(bookId: string, page: number, chapterId?: string, snippet?: string): Promise<boolean> {
    const db = getDb();
    const exists = await BookmarkRepository.isBookmarked(bookId, page);
    if (exists) {
      await db.execute('DELETE FROM bookmarks WHERE bookId = ? AND page = ?;', [bookId, page]);
      return false;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await db.execute('INSERT INTO bookmarks (id, bookId, page, chapterId, snippet, createdAt) VALUES (?, ?, ?, ?, ?, ?);', [
      id,
      bookId,
      page,
      chapterId ?? null,
      snippet ?? null,
      Date.now(),
    ]);
    return true;
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.execute('DELETE FROM bookmarks WHERE id = ?;', [id]);
  },

  async listAll(): Promise<Bookmark[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM bookmarks ORDER BY createdAt DESC;');
    return res.rows?._array ?? res.rows ?? [];
  },
};
