// Migration 002 — FTS5 books_fts per phase-2.md:5.1.1
export const MIGRATION_002 = `
CREATE VIRTUAL TABLE IF NOT EXISTS books_fts USING fts5(
  title, author, genre, shelfNames, fileName,
  content='books',
  content_rowid='id',
  tokenize='unicode61 "remove_diacritics 2"',
  prefix='2 3 4',
  detail='full'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS books_ai AFTER INSERT ON books BEGIN
  INSERT INTO books_fts(rowid, title, author, genre, shelfNames, fileName)
  VALUES (new.id, new.title, new.author, '', '', new.originalFileName);
END;

CREATE TRIGGER IF NOT EXISTS books_ad AFTER DELETE ON books BEGIN
  INSERT INTO books_fts(books_fts, rowid, title, author, genre, shelfNames, fileName)
  VALUES('delete', old.id, old.title, old.author, '', '', old.originalFileName);
END;

CREATE TRIGGER IF NOT EXISTS books_au AFTER UPDATE ON books BEGIN
  INSERT INTO books_fts(books_fts, rowid, title, author, genre, shelfNames, fileName)
  VALUES('delete', old.id, old.title, old.author, '', '', old.originalFileName);
  INSERT INTO books_fts(rowid, title, author, genre, shelfNames, fileName)
  VALUES (new.id, new.title, new.author, '', '', new.originalFileName);
END;

-- Shelf names denormalization trigger
CREATE TRIGGER IF NOT EXISTS book_shelves_ai AFTER INSERT ON book_shelves BEGIN
  UPDATE books_fts SET shelfNames = (
    SELECT group_concat(s.name, ' ') FROM shelves s
    JOIN book_shelves bs ON bs.shelfId = s.id
    WHERE bs.bookId = new.bookId
  ) WHERE rowid = new.bookId;
END;

CREATE TRIGGER IF NOT EXISTS book_shelves_ad AFTER DELETE ON book_shelves BEGIN
  UPDATE books_fts SET shelfNames = (
    SELECT group_concat(s.name, ' ') FROM shelves s
    JOIN book_shelves bs ON bs.shelfId = s.id
    WHERE bs.bookId = old.bookId
  ) WHERE rowid = old.bookId;
END;
`;
