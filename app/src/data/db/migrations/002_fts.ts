// Migration 002 — FTS5 books_fts per phase-2.md:5.1.1 (internal-content)
// NOTE: Internal-content FTS5 (no content= / content_rowid). books.id is a
// TEXT uuid; FTS5 rowids are INTEGER — external-content with
// content_rowid='id' throws "datatype mismatch" in every books_ai/au/ad
// trigger. So we store bookId as a regular column and sync via
// bookId-keyed triggers. The books table has no genre/shelfNames columns —
// genre is '' and shelfNames is denormalized by book_shelves triggers.
export const MIGRATION_002 = `
CREATE VIRTUAL TABLE IF NOT EXISTS books_fts USING fts5(
  title, author, genre, shelfNames, fileName, bookId,
  tokenize='unicode61 remove_diacritics 2',
  prefix='2 3 4',
  detail='full'
);

-- Keep books_fts in sync with books (delete+reinsert keeps rank fresh)
CREATE TRIGGER IF NOT EXISTS books_ai AFTER INSERT ON books BEGIN
  INSERT INTO books_fts(bookId, title, author, genre, shelfNames, fileName)
  VALUES (new.id, new.title, new.author, '', '', new.originalFileName);
END;

CREATE TRIGGER IF NOT EXISTS books_ad AFTER DELETE ON books BEGIN
  DELETE FROM books_fts WHERE bookId = old.id;
END;

CREATE TRIGGER IF NOT EXISTS books_au AFTER UPDATE ON books BEGIN
  DELETE FROM books_fts WHERE bookId = old.id;
  INSERT INTO books_fts(bookId, title, author, genre, shelfNames, fileName)
  VALUES (new.id, new.title, new.author, '', '', new.originalFileName);
END;

-- Shelf names denormalization (books_fts.shelfNames)
CREATE TRIGGER IF NOT EXISTS book_shelves_ai AFTER INSERT ON book_shelves BEGIN
  UPDATE books_fts SET shelfNames = (
    SELECT group_concat(s.name, ' ') FROM shelves s
    JOIN book_shelves bs ON bs.shelfId = s.id
    WHERE bs.bookId = new.bookId
  ) WHERE bookId = new.bookId;
END;

CREATE TRIGGER IF NOT EXISTS book_shelves_ad AFTER DELETE ON book_shelves BEGIN
  UPDATE books_fts SET shelfNames = (
    SELECT group_concat(s.name, ' ') FROM shelves s
    JOIN book_shelves bs ON bs.shelfId = s.id
    WHERE bs.bookId = old.bookId
  ) WHERE bookId = old.bookId;
END;
`;
