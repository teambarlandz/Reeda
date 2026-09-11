import { getDb } from '../db';

export type Chapter = {
  id: string;
  bookId: string;
  ordering: number;
  title: string;
  pageStart?: number;
  level: number;
  parentId?: string;
};

export const ChapterRepository = {
  async list(bookId: string): Promise<Chapter[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM chapters WHERE bookId = ? ORDER BY ordering ASC;', [bookId]);
    return res.rows?._array ?? res.rows ?? [];
  },

  async upsert(chapter: Chapter): Promise<void> {
    const db = getDb();
    await db.execute(
      `INSERT OR REPLACE INTO chapters (id, bookId, ordering, title, pageStart, level, parentId)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [chapter.id, chapter.bookId, chapter.ordering, chapter.title, chapter.pageStart ?? null, chapter.level, chapter.parentId ?? null],
    );
  },

  async clearForBook(bookId: string): Promise<void> {
    const db = getDb();
    await db.execute('DELETE FROM chapters WHERE bookId = ?;', [bookId]);
  },
};
