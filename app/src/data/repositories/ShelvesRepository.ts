import { getDb } from '../db';

export const ShelvesRepository = {
  async list() {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM shelves ORDER BY name ASC;');
    return res.rows?._array ?? res.rows ?? [];
  },

  async create(name: string) {
    const db = getDb();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await db.execute('INSERT INTO shelves (id, name, createdAt) VALUES (?, ?, ?);', [id, name, Date.now()]);
    return id;
  },

  async assign(bookId: string, shelfId: string) {
    const db = getDb();
    await db.execute('INSERT OR IGNORE INTO book_shelves (bookId, shelfId) VALUES (?, ?);', [bookId, shelfId]);
  },

  async remove(bookId: string, shelfId: string) {
    const db = getDb();
    await db.execute('DELETE FROM book_shelves WHERE bookId = ? AND shelfId = ?;', [bookId, shelfId]);
  },
};
