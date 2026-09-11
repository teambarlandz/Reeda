// Migration 001 — initial schema per phase-2.md:5.1
export const MIGRATION_001 = `
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  coverPath TEXT,
  filePath TEXT NOT NULL,
  originalFileName TEXT,
  format TEXT NOT NULL,
  fileHash TEXT,
  fileSize INTEGER,
  addedAt INTEGER NOT NULL,
  lastOpenedAt INTEGER,
  totalPages INTEGER,
  status TEXT DEFAULT 'want_to_read',
  isSample INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY NOT NULL,
  bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  ordering INTEGER NOT NULL,
  title TEXT NOT NULL,
  pageStart INTEGER,
  level INTEGER DEFAULT 0,
  parentId TEXT
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY NOT NULL,
  bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page INTEGER NOT NULL,
  chapterId TEXT,
  snippet TEXT,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY NOT NULL,
  bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page INTEGER,
  chapterId TEXT,
  text TEXT NOT NULL,
  color TEXT NOT NULL,
  rangeStart INTEGER,
  rangeEnd INTEGER,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY NOT NULL,
  bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  highlightId TEXT REFERENCES highlights(id) ON DELETE SET NULL,
  page INTEGER,
  chapterId TEXT,
  text TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reading_progress (
  bookId TEXT PRIMARY KEY NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  currentPage INTEGER DEFAULT 0,
  currentChapterId TEXT,
  progressPercent REAL DEFAULT 0,
  timeSpentMs INTEGER DEFAULT 0,
  lastPosition TEXT,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  startedAt INTEGER NOT NULL,
  endedAt INTEGER,
  durationMs INTEGER DEFAULT 0,
  pagesRead INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shelves (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS book_shelves (
  bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  shelfId TEXT NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
  PRIMARY KEY (bookId, shelfId)
);

CREATE TABLE IF NOT EXISTS dictionary_history (
  word TEXT PRIMARY KEY NOT NULL,
  definition TEXT,
  lookedUpAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
  query TEXT PRIMARY KEY NOT NULL,
  searchedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_highlights_bookId ON highlights(bookId);
CREATE INDEX IF NOT EXISTS idx_notes_bookId ON notes(bookId);
CREATE INDEX IF NOT EXISTS idx_chapters_bookId ON chapters(bookId);
`;
