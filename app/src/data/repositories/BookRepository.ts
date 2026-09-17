import { getDb } from '../db';

export type Book = {
  id: string;
  title: string;
  author?: string;
  coverPath?: string;
  filePath: string;
  originalFileName?: string;
  format: string;
  fileHash?: string;
  fileSize?: number;
  addedAt: number;
  lastOpenedAt?: number;
  totalPages?: number;
  status: string;
  isSample: number;
};

// Sanitizer per phase-2.md:5.1.1 ftsPrefixQuery
export function ftsPrefixQuery(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Escape special FTS chars and split
  const tokens = trimmed
    .split(/\s+/)
    .map(t => t.replace(/["'*:\-]/g, '').trim())
    .filter(t => t.length >= 2);
  if (tokens.length === 0) return null;
  // Wrap each as "token"* with AND
  return tokens.map(t => `"${t}"*`).join(' AND ');
}

export const BookRepository = {
  async list(): Promise<Book[]> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM books ORDER BY addedAt DESC;');
    return res.rows?._array ?? res.rows ?? [];
  },

  async count(): Promise<number> {
    const db = getDb();
    const res: any = await db.execute('SELECT COUNT(*) as c FROM books;');
    const row = (res.rows?._array ?? res.rows ?? [])[0];
    return row?.c ?? 0;
  },

  async get(id: string): Promise<Book | null> {
    const db = getDb();
    const res: any = await db.execute('SELECT * FROM books WHERE id = ?;', [id]);
    const rows = res.rows?._array ?? res.rows ?? [];
    return rows[0] ?? null;
  },

  async upsert(book: Book): Promise<void> {
    const db = getDb();
    await db.execute(
      `INSERT OR REPLACE INTO books (id, title, author, coverPath, filePath, originalFileName, format, fileHash, fileSize, addedAt, lastOpenedAt, totalPages, status, isSample)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [book.id, book.title, book.author ?? null, book.coverPath ?? null, book.filePath, book.originalFileName ?? null, book.format, book.fileHash ?? null, book.fileSize ?? null, book.addedAt, book.lastOpenedAt ?? null, book.totalPages ?? null, book.status, book.isSample],
    );
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.execute('DELETE FROM books WHERE id = ?;', [id]);
  },

  async search(query: string, facet: 'all' | 'title' | 'author' | 'genre' | 'shelf' = 'all', limit = 30): Promise<Book[]> {
    const db = getDb();
    if (!query.trim()) return [];
    const sanitized = ftsPrefixQuery(query);
    if (!sanitized) return [];
    // Map facet to column filter
    let matchExpr = sanitized;
    if (facet !== 'all') {
      const colMap: Record<string, string> = {
        title: 'title',
        author: 'author',
        genre: 'genre',
        shelf: 'shelfNames',
      };
      const col = colMap[facet];
      if (col) {
        // Convert "a"* AND "b"* -> col:a* AND col:b* equivalent: wrap each token
        const tokens = sanitized.split(' AND ').map(t => `${col}:${t}`);
        matchExpr = tokens.join(' AND ');
      }
    }
    try {
      const res: any = await db.execute(
        `SELECT b.*, rank FROM books_fts
         JOIN books b ON b.id = books_fts.bookId
         WHERE books_fts MATCH ?
         ORDER BY rank
         LIMIT ?;`,
        [matchExpr, limit],
      );
      return res.rows?._array ?? res.rows ?? [];
    } catch (e) {
      // FTS syntax error already sanitized, but fallback empty
      return [];
    }
  },
};
