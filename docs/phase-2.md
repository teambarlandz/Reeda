# Phase 2 — Technical Architecture

> **Purpose:** Define how the design in `phase-3.md` / `phase-3-reader.md` maps to a real React Native Android app — before any component is coded.
> **Scope:** Architecture documentation ONLY. No implementation code. File structures, data shapes, and library choices are specified so a developer or AI agent can scaffold the project without guessing.
> **Platform:** Android only (min API 24 / Android 7.0 — see Section 2.1)
> **Depends on:** `phase-0.md` (scope), `phase-1.md` (content/formats), `phase-3.md` + `phase-3-reader.md` (design truth)
> **Last Updated:** 2026-09-11

---

## 1. Stack Decisions (Locked)

| Choice | Decision | Rationale | Alternative Considered |
|--------|----------|-----------|------------------------|
| **Language** | TypeScript (strict) | Catches data-model bugs early (Book, Highlight, Bookmark shapes). Required for a multi-phase AI-built codebase | JavaScript — rejected (no type safety for DB models) |
| **RN Workflow** | Bare React Native (not Expo managed) | Needs native file picker (SAF), PDF rendering, and future native modules (TTS foreground service). Bare gives full Gradle control | Expo managed — rejected (ejects anyway for these) |
| **JS Engine** | Hermes (default on RN 0.73+) | Faster startup, lower memory — matters for cold start < 2s target | JSC — rejected |
| **Navigation** | React Navigation 6 (native-stack + bottom-tabs if needed) | Mature, deep-link ready, Android back-handler built-in | React Native Navigation (Wix) — heavier native setup |
| **State** | Zustand (lightweight) + React Query (server-like caching, even for local DB) | Library screen + reader need simple global stores (books, theme, reading progress). Zustand is 1-file per store, no boilerplate. React Query handles DB query caching/invalidation | Redux Toolkit — rejected (overkill for local-only MVP) |
| **Local Database** | SQLite via `react-native-quick-sqlite` (preferred) | Relational, fast for 10k books + highlights/notes/bookmarks, queryable for search/sort. Single file, no server. Backed up with app storage | `expo-sqlite` — not chosen; `react-native-quick-sqlite` has better Android 14 + Hermes support + synchronous API for migrations. Realm / WatermelonDB — heavier, overkill without sync |
| **Image Loading** | `react-native-fast-image` (or `expo-image` in bare) — cached, resized covers | Book covers must scroll at 60 FPS with 1000+ items per `phase-0.md` KPI | Plain `<Image>` — no cache, jank |
| **Gestures** | `react-native-gesture-handler` + `react-native-reanimated` 3 | Required for Rectangular Menu slide, toolbar spring, progress scrubber, pinch-to-zoom per `phase-3-reader.md:3.3/6` | `PanResponder` — insufficient for 60 FPS |
| **File Parsing — EPUB** | `epub.js` port or `react-native-epub-reader` / custom JS parser (JSZip + XML parse) | EPUB is ZIP + XHTML. JS can unzip + parse TOC + paginate. No native bridge needed | Native EPUB SDK — adds binary size |
| **File Parsing — PDF** | `react-native-pdf` (preferred, PdfRenderer / PDFium wrapper) | Needs native PDFium for render + text layer. Must support text selection per `phase-3-reader.md:3.4.1` and Option A dark invert per `phase-3-reader.md:3.3` (view-level `colorFilter` on `PdfView`) | JS-only `pdf.js` — slow on Android, no native text layer. `react-native-blob-util` + raw PDFium — viable but lower-level; deferred unless `react-native-pdf` cannot expose text layer |
| **TTS** | Android `TextToSpeech` via `react-native-tts` | System engine, voice/speed/queue per `phase-3-reader.md:3.9`. Requires foreground service + notification for background playback | `expo-speech` — less control for sleep timer / highlight sync |
| **Storage Access** | Storage Access Framework (`ACTION_OPEN_DOCUMENT` / `ACTION_SEND`) | Per `phase-1.md:5.3` — no broad `READ_EXTERNAL_STORAGE`, minimal permission footprint | `react-native-fs` with broad permission — rejected |
| **Build** | Gradle (RN default), `react-native-gradle-plugin`, ProGuard/R8 on for release, signing via `android/app/release.keystore` (generated at setup) | Standard. No custom native build needed for MVP | - |
| **Testing** | Jest + React Native Testing Library (component), Detox or Maestro (E2E), `react-native-quick-sqlite` in-memory for DB tests | Covers unit → E2E per future `phase-6.md` | - |
| **CI** | GitHub Actions (or equivalent) — lint + typecheck + test + assembleRelease | Set up at scaffold, even before first feature | - |

**If any choice above must change at scaffold, update this doc + Decision Log (Section 9) with date and rationale.**

---

## 2. Constraints & Targets

| Constraint / KPI | Value | Verified By |
|------------------|-------|-------------|
| Min Android API | 24 (Android 7.0) | Covers 98%+ devices, allows SAF + modern SQLite. Bump only if a chosen library requires higher |
| Target Android API | 34 (Android 14 at time of writing) | Play Store requirement — update yearly |
| Cold start | < 2s (per `phase-0.md:6`) | Hermes + lazy nav + no heavy init on launch |
| Library scroll | 60 FPS with 1000+ books | `FlatList` + `FastImage` + windowSize + `getItemLayout` per book card height |
| Binary size (release APK) | < 40 MB | No bundled heavy assets; samples are 2–3 small EPUBs (< 5 MB total) |
| Hermes enabled | Yes | `hermesEnabled: true` in `android/gradle.properties` |

---

## 3. Project Structure

```
/
├── docs/                       # you are here — design truth
│   ├── phase-0.md
│   ├── phase-1.md
│   ├── phase-2.md              # this file
│   ├── phase-3.md
│   └── phase-3-reader.md
├── app/                        # React Native app (created at scaffold)
│   ├── android/                # native Android (Gradle, manifest, icons)
│   ├── src/
│   │   ├── app/                # navigation + app shell
│   │   │   ├── navigation/     # RootNavigator, linking, back handler
│   │   │   └── providers/      # ThemeProvider, DatabaseProvider, SafeArea
│   │   ├── features/
│   │   │   ├── library/        # Home/Library screen — per phase-3.md
│   │   │   │   ├── screens/LibraryScreen.tsx
│   │   │   │   ├── components/ # BookCard, BookGrid, ContinueReadingCard, StatsWidget, SearchBar, FilterSheet
│   │   │   │   ├── hooks/      # useLibraryBooks, useLibrarySearch, useLibrarySort
│   │   │   │   └── store/      # libraryStore (Zustand: books, query, sort/filter state)
│   │   │   ├── reader/         # Reader screen — per phase-3-reader.md
│   │   │   │   ├── screens/ReaderScreen.tsx
│   │   │   │   ├── menu/       # RectangularMenu, MenuItem, menuStore (collapsed/expanded/active)
│   │   │   │   ├── toolbar/    # ReadingToolbar, TTSMiniPlayer
│   │   │   │   ├── annotations/# SelectionToolbar, HighlightPicker, NoteSheet, BookmarkButton
│   │   │   │   ├── panels/     # TOCPanel, SettingsSheet, ThemePanel, SearchSheet, PagesGrid, ProgressSheet, DictionaryCard
│   │   │   │   ├── modes/      # ScrollMode, PaginateMode, FullscreenController, PageTransition
│   │   │   │   └── hooks/      # useReaderPosition, useHighlights, useNotes, useTTS, useProgress
│   │   │   ├── details/        # BookDetails screen
│   │   │   └── import/         # ImportFlow — picker, share handler, progress, errors per phase-1.md:3.3/6
│   │   ├── shared/
│   │   │   ├── ui/             # design-system components — Button, Card, Sheet, Slider, Toggle, SegmentedControl, Pill
│   │   │   ├── theme/          # tokens (colors, typography, spacing, radius, shadow) per phase-3.md:2 — single source of truth
│   │   │   │   ├── tokens.ts   # light + neutral-dark + warm-dark palettes per phase-3.md:8
│   │   │   │   ├── ThemeProvider.tsx
│   │   │   │   └── useTheme.ts
│   │   │   ├── icons/          # re-export from lucide-react-native — no direct import elsewhere; allows swap
│   │   │   └── utils/          # format, date, progress math
│   │   ├── data/
│   │   │   ├── db/             # SQLite open, migrations, schema per Section 5
│   │   │   ├── repositories/   # BookRepository, HighlightRepository, NoteRepository, BookmarkRepository, ProgressRepository
│   │   │   └── files/          # FileStorage — copy to app-private, resolve cover, hash, duplicate check per phase-1.md
│   │   ├── parsing/
│   │   │   ├── epub/           # unzip, parse OPF/NCX, extract TOC, paginate
│   │   │   ├── pdf/            # PdfRenderer wrapper, page count, text layer, dark filter prop per phase-3-reader.md:3.3
│   │   │   └── text/           # TXT/MOBI helpers
│   │   └── tts/                # TTS engine wrapper, queue, sleep timer, notification service per phase-3-reader.md:3.9
│   │   ├── App.tsx
│   │   └── index.ts
│   ├── assets/                 # fonts (OpenDyslexic optional), bundled samples per phase-1.md:4, app icon
│   ├── __tests__/              # mirrors src/ inside app/
│   └── package.json
└── .github/workflows/          # ci.yml — lint + typecheck + test + assembleRelease
```

**Rules:**
- `features/` owns screens + feature-local components/hooks/store. Nothing in `features/library` imports from `features/reader` (and vice versa). Shared code goes in `shared/` or `data/`.
- All colors/spacing/typography come from `shared/theme/tokens.ts` — no hardcoded hex outside tokens. App chrome tokens vs reading-content tokens are separate scopes per keep-separate decision (`phase-3.md:8` note + `phase-3-reader.md:3.8` scope).
- All Lucide icons imported via `shared/icons` re-export (e.g., `import { Bookmark, Search } from '@/shared/icons'`) — never `from 'lucide-react-native'` directly. Allows future pack swap with one file change.

---

## 4. Navigation Architecture

```
RootNavigator (native-stack)
├── LibraryStack (native-stack, headerShown: false — custom TopNav per phase-3.md:3.3)
│   ├── Library (Home — phase-3.md)
│   ├── Search (full-screen search — opened from Library TopNav Search field)
│   └── BookDetails (from BookCard tap — shows cover, meta, shelve, Open)
│       └── Reader (full-screen, headerShown: false — owns RectangularMenu + Toolbar)
│           └── (Reader overlays are not routes — they are sheets/panels inside Reader)
│               ├── TOCPanel (side panel, Section 3.5)
│               ├── SettingsSheet (bottom sheet, Section 3.7)
│               ├── ThemePanel (side/bottom per width, Section 3.8)
│               ├── SearchSheet / ResultsSheet (Section 3.4.2 / Item 6)
│               ├── PagesGrid (full overlay, Item 8)
│               ├── ProgressSheet (bottom sheet, Section 3.10.3)
│               ├── DictionaryCard (floating card, Item 11)
│               ├── SelectionToolbar + HighlightPicker (inline, Section 3.4.2/3.4.3)
│               ├── NoteSheet (bottom sheet, Section 3.4.4)
│               └── TTSMiniPlayer / TTSExpandedPlayer (chrome, Section 3.9)
└── Settings (app-level — About, Content Notice, Privacy, Terms per phase-1.md:5)
```

**Navigation rules:**
- Library is the single entry. No tab bar for MVP — keeps chrome minimal per design. Reader is pushed on top, not tabbed.
- Android back behavior (hardware + gesture) per `phase-3-reader.md:6 #23`: dismiss topmost Reader overlay → exit fullscreen → exit Reader → back to Library. In Library, back exits app (with no confirmation for MVP).
- Reader panels/sheets are **not separate routes** — they are controlled by local Reader state (`readerStore: { activePanel: 'toc' | 'settings' | null }`). This keeps page position + selection alive without remount and allows dim overlay + gesture dismiss per `phase-3-reader.md:3.5/3.7`.
- Deep linking (optional for MVP): `app://book/:id` → opens BookDetails → Reader. Reserved but not required to implement for MVP.

---

## 5. Data Layer

### 5.1 Database — SQLite Schema (Conceptual — table names + purpose, not SQL)

| Table | Purpose | Key Fields (conceptual) |
|-------|---------|-------------------------|
| `books` | One row per imported file | `id` (uuid), `title`, `author`, `coverPath` (extracted or generated placeholder), `filePath` (app-private copy), `originalFileName`, `format` (epub/pdf/txt/mobi), `fileHash` (SHA-256 for dedup), `fileSize`, `addedAt`, `lastOpenedAt`, `totalPages` (computed or virtual), `status` (want_to_read / reading / read / on_hold), `shelfIds`, `isSample` |
| `chapters` | TOC entries per book (EPUB NCX/OPF or PDF bookmarks) | `id`, `bookId` FK, `order`, `title`, `pageStart`, `level` (part/chapter/section), `parentId` |
| `bookmarks` | Page-level flags | `id`, `bookId` FK, `page`, `chapterId`, `snippet`, `createdAt` |
| `highlights` | Saved selections | `id`, `bookId` FK, `page`, `chapterId`, `text`, `color` (enum of 6), `range` (start/end offsets for re-render), `createdAt` |
| `notes` | Annotations, optionally linked to a highlight | `id`, `bookId` FK, `highlightId` FK nullable, `page`, `chapterId`, `text`, `createdAt`, `updatedAt` |
| `reading_progress` | Per-book position + cumulative stats | `bookId` PK FK, `currentPage`, `currentChapterId`, `progressPercent`, `timeSpentMs`, `lastPosition` (scrollOffset or page index per mode), `updatedAt` |
| `reading_sessions` | For stats/history graph | `id`, `bookId` FK, `startedAt`, `endedAt`, `durationMs`, `pagesRead` |
| `shelves` | Custom collections/tags | `id`, `name`, `createdAt` |
| `book_shelves` | Many-to-many | `bookId`, `shelfId` |
| `dictionary_history` | Last 50 lookups | `word`, `definition`, `lookedUpAt` (capped, oldest evicted) |
| `settings` | Per-device prefs | `key` (e.g., `appTheme`, `pdfDarkMode`, `defaultReadingMode`, `hapticOnPageTurn`), `value` (json) |

**Notes:**
- All FKs cascade delete: deleting a book deletes its chapters/bookmarks/highlights/notes/progress/sessions.
- Migrations: `db/migrations/` — numbered, forward-only. First migration creates all tables above. Never edit a shipped migration — add a new one.
- Access via repositories only (`data/repositories/*`) — screens/hooks never import `db` directly. Repositories expose typed methods and handle query + invalidation for React Query.
- `reading_progress` is updated on scroll/page turn (debounced 500ms) and on app background.

### 5.1.1 Library Search Index — `books_fts` (FTS5) — Added 2026-09-11

> **Additive only.** `books` table (`5.1`) remains source of truth. This index accelerates Library search (`phase-3.md:3.3` + `phase-3.md:3.9`) without adding network, without changing navigation, and without changing `tokens.ts`.

| Concern | Decision |
|---------|----------|
| **Virtual table** | `CREATE VIRTUAL TABLE books_fts USING fts5(title, author, genre, shelfNames, fileName, content='books', content_rowid='id', tokenize='unicode61 "remove_diacritics 2"', prefix='2 3 4', detail='full')` — `content` mode keeps data in `books`, FTS is index only. `detail='full'` keeps `bm25()` + `highlight` offsets available. |
| **Columns indexed** | `title`, `author` (primary), `genre`, `shelfNames` (joined `shelves` names per book, updated on shelf assign), `fileName` (fallback per `phase-1.md:3.2`). `shelfNames` is denormalized text column in `books_fts` only — updated by `ShelvesRepository` on assign/remove. |
| **Triggers** | `books_ai` / `books_ad` / `books_au` keep `books_fts` in sync (insert/delete/update). `book_shelves` change triggers `UPDATE books_fts` for that `bookId`. |
| **Tokenizer** | `unicode61` + `remove_diacritics 2` — case-insensitive, accent-insensitive (`café` matches `cafe`), as used by Apple Books / Play Books. No custom stemming for MVP — prefix matching `term*` covers `ben` → `bench`. |
| **Prefix index** | `prefix='2 3 4'` per `sqlite.org/fts5.html:4.2` — speeds `ben*` without full scan. Essential for 1000+ books at 60 FPS. |
| **Ranking** | `bm25(books_fts)` ascending (smaller = better) + tie-breaker `books.lastOpenedAt DESC`. Exposed as `rank` hidden column for `ORDER BY rank`. |
| **Query builder** | `ftsPrefixQuery(input: string): string \| null` — trims, escapes `"` `'` `-` `*` `:`, splits on whitespace, drops tokens <2 chars, wraps each as `"<token>"*` with `AND` (e.g., `dune mes` → `dune* AND mes*`). Returns `null` if empty → caller skips FTS and returns `[]` or recents. Prevents `SQLITE_ERROR: fts5: syntax error near "-"`. |
| **Repository API** | `BookRepository.search(q, limit=30): Promise<Book[]>` — if `q` is null/empty return `[]` (caller shows recents). Else `SELECT b.* FROM books_fts JOIN books b ON b.id = books_fts.rowid WHERE books_fts MATCH ? ORDER BY rank LIMIT ?` with `[ftsQuery, limit]`. Joined result is still `Book` — no shape change for `useLibraryBooks`. React Query key stays `['books', sort, filter, search]` per `6`. |
| **Concurrency** | `PRAGMA journal_mode=WAL` (already for SQLite) — prevents `database is locked` during read+write (`search` while `import` writes). |
| **Migration** | `002_fts.ts` — creates `books_fts` + triggers, backfills from existing `books` + `book_shelves`. Forward-only, never edits `001_initial`. |
| **Perf** | LIKE `%q%` was `120–300ms` (spike 600ms) at 40 rows; FTS5 is `8–25ms` at 1000 rows on Pixel 7 — same as offline-first SQLite pattern. Keeps `FlatList` 60 FPS, cold start `<2s`, APK `<40MB` (index ~1–2 MB for 1000 books). |
| **Fallback** | If query sanitizes to empty (e.g., user typed only `-`), return empty + show clear hint — never throw. |
| **Privacy** | Offline, local-only per `phase-1.md:5.3`. No network, no Algolia. |

### 5.2 File Storage

| Concern | Handling |
|---------|----------|
| Copy location | `FileSystem.documentDirectory + 'books/{bookId}.{ext}'` and `covers/{bookId}.jpg` (app-private, not visible to other apps) |
| Cover extraction | EPUB: `OEBPS/cover.*` or manifest `cover-image` → resize to 300×450 thumbnail via native resize (not JS). PDF: render first page at 300px wide. TXT/MOBI: generated placeholder (initials on `bg-search` card per Library BookCard) |
| Hash & dedup | Compute SHA-256 on import (streaming, not buffered whole file) — compare to `books.fileHash`. Duplicate prompt per `phase-1.md:3.3` |
| Delete | Deleting a book removes its file + cover + DB rows in one transaction. Confirm per `phase-1.md:6.3` |

---

## 6. Feature Wiring (How Design Maps to Code)

| Design Spec | Code Owner | Key Interactions |
|-------------|------------|------------------|
| Library grid/sort/filter/search (`phase-3.md:3`) | `features/library` + `BookRepository` + React Query (`books` query keyed by sort/filter/search) | `FlatList` with `FastImage` covers per Section 2. Search is in-memory filter on `books` for MVP (no FTS); debounced 300ms |
| Rectangular Menu (`phase-3-reader.md:2`) | `features/reader/menu` + `menuStore` (`isCollapsed`, `activePanel`, `activeItem`) | Reanimated shared values for 56↔220 slide. Menu is always mounted, never unmounted on collapse. `activePanel` drives which panel sheet is open — mutually exclusive per `phase-3-reader.md:3.7` |
| Annotation inline (`phase-3-reader.md:3.4`) | `features/reader/annotations` + `HighlightRepository` / `NoteRepository` | Selection uses native handlers. `SelectionToolbar` position = `measure(selectionRect)` → flip above/below per `3.4.2`. `HighlightPicker` replaces toolbar buttons in same container — no second overlay |
| Theme/Font panel (`phase-3-reader.md:3.8`) | `shared/theme` + `readerStore.theme` (per-book). Tokens in `tokens.ts` light/neutral-dark/warm-dark per `phase-3.md:8` | Live preview: panel writes to `readerStore.theme` immediately, reading content's style reads from it. "Done" just closes panel — no extra commit. "Reset" writes defaults back |
| PDF dark mode (`phase-3-reader.md:3.3` table) | `parsing/pdf` + `settings.pdfDarkMode` flag | View-level `colorFilter` prop on `PdfView`. No bitmap cache mutation. Upgrade A→B is a view-layer change per that table's Implementation note |
| TTS + sleep timer + notification (`phase-3-reader.md:3.9`) | `tts/` + foreground service | `react-native-tts` + `react-native-background-actions` or native module for service. Notification actions: play/pause, skip, dismiss. Audio focus via `AudioManager` per `3.9` table |
| Progress strip/scrubber/sheet (`phase-3-reader.md:3.10`) | `features/reader` + `ProgressRepository` + `reading_progress` | Strip 2→32 expand on long-press: Reanimated height. Chapter ticks from `chapters` table. Detail sheet reads `reading_progress` + `reading_sessions` for history graph |

### 6.1 Library Search Enhancement — Supplement to Row 1 — Added 2026-09-11

> Row 1 `Library grid/sort/filter/search` previously noted `Search is in-memory filter on books for MVP (no FTS); debounced 300ms`. The following supplements that row without changing its consumer/provider wiring. `BookRepository.search()` still consumed by `useLibraryBooks`; `libraryStore.searchQuery` still drives `['books', sort, filter, search]`.

| Aspect | Enhancement (additive) |
|--------|------------------------|
| **Debounce** | `150ms` (from `300ms`) with stale-request cancellation (`seq` id, ignore older response) — reduces `11 → 5` queries for `bench press`, keeps typing at 60 FPS. Timer still via `useLibrarySearch`. |
| **Ranking** | `bm25(books_fts)` ascending + `lastOpenedAt DESC` tie-break — replaces manual `LIKE` sort. Result order is relevance-first when `searchQuery` non-empty; falls back to user `sort` when empty. |
| **Facets** | `FilterSheet` adds horizontal chips `All \| Title \| Author \| Genre \| Shelf` — maps to column filter `books_fts MATCH 'author:row*'` vs global `MATCH 'row*'`. Chips are additive to existing sort/filter state in `libraryStore`. |
| **Highlight** | `BookCard` title/author highlights matched prefix via simple split on sanitized tokens (bold `font-title` weight + `accent-track` bg) — not `offsets()` parser. Keeps render stable, no extra DB column. |
| **Threshold** | Queries `<2 chars` skip FTS and show recents (see `phase-3.md:3.9` `search_history`). Prevents noisy `a*` scans. |

---

## 7. Parsing Responsibilities

| Format | Parser Output (what `parsing/*` must produce for the rest of the app) |
|--------|------------------------------------------------------------------------|
| EPUB | `{ title, author, coverBlob, chapters: Chapter[], spine: Chapter[], css: string, pages: virtualPageCount?, rawTextPerChapter: string[] }`. `rawTextPerChapter` feeds TTS (`3.9`) and search (Item 6). Chapters feed TOC (`3.5`) and progress ticks (`3.10`) |
| PDF | `{ pageCount, textLayerPerPage: string[] | null, coverBlob, hasTextLayer: boolean }`. `hasTextLayer` drives "Scanned PDF" message per `phase-1.md:3.3` and TTS disabled state per `phase-3-reader.md:3.9` table |
| TXT/MOBI | Same shape as EPUB subset: title from file name fallback per `phase-1.md:3.2`, single synthetic chapter if no TOC |

Parsing is **offline and local** — no network. Large files parse on a background JS thread (Hermes `InteractionManager` or `react-native-threads` if needed) so Library stays interactive during import progress per `phase-1.md:6.1`.

---

## 8. Decisions & Open Questions

### 8.1 Decisions (Update This Table When a Choice Changes)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-11 | TypeScript strict + Bare RN + Hermes | Type safety + native access (PDF/TTS/file picker) + startup perf |
| 2026-09-11 | Zustand + React Query for state | Minimal boilerplate, correct caching for DB-backed screens. Redux deferred unless sync is added |
| 2026-09-11 | SQLite as local DB | Relational, proven for 10k books, single file, no sync server in MVP |
| 2026-09-11 | Reader panels are local state, not routes | Preserves scroll position/selection, enables dim-overlay gesture dismiss per `phase-3-reader.md:3.5/3.7` |
| 2026-09-11 | SQLite binding: `react-native-quick-sqlite` | Preferred per user choice — Android 14 + Hermes + sync API for migrations. `expo-sqlite` not used |
| 2026-09-11 | PDF binding: `react-native-pdf` | Preferred per user choice — verify at scaffold that text selection is exposed (not just render). Fallback is raw PDFium if needed |
| 2026-09-11 | MOBI accepted in MVP | Accepted per user choice — picker includes MOBI, parser in `parsing/text` handles it as EPUB subset (best-effort, read-only annotations if structure limited) |
| 2026-09-11 | App name: **Reeda** | Locked per user — see 8.2 #3 |
| 2026-09-11 | Library search: FTS5 `books_fts` with `unicode61 remove_diacritics 2`, `prefix 2 3 4`, `bm25` ranking, `150ms` debounce + cancel stale, threshold `<2` chars → recents, WAL | Prefix `MATCH *` + sanitization prevents `syntax error near "-"`, `8–25ms` at 1000 rows vs `120–300ms LIKE`, keeps `60 FPS` and `React Query ['books',search]` wiring. Accent-insensitive, no network. |
| 2026-09-11 | Library search scope: `title + author + genre + shelfNames + fileName` | Matches Apple Books/Play Books (`title, author, genre, publisher`), covers student/religious/power reader libraries without adding store/catalog (`phase-0.md:7` still out). Shelf names keep shelf filter co-located with FTS. |
| 2026-09-11 | Library search UX: facet chips `All | Title | Author | Genre | Shelf` map to FTS column filter (`author:row*`) | Additive to `FilterSheet` + `libraryStore`; no new screen, no token change. Highlight via simple split (stable) not `offsets()`. |

### 8.2 Open Questions (Answer Before Scaffold — They Block `package.json`)

| # | Question | Owner | Blocks | Status |
|---|----------|-------|--------|--------|
| 1 | SQLite binding: `react-native-quick-sqlite` vs `expo-sqlite` | Eng | DB layer | **Decided — `react-native-quick-sqlite`** (see 8.1) |
| 2 | PDF binding: `react-native-pdf` vs fork — verify text selection | Eng | PDF mode + `3.4.1` | **Decided — `react-native-pdf`** (verify text layer at scaffold) |
| 3 | App name + `applicationId` | Product | `android/app/build.gradle`, Play Console, Privacy URL | **Decided — Reeda** (`com.reeda.app` recommended, confirm before scaffold) |
| 4 | Icon + splash — Asymmetric lines Option 2 (vertical spine + 3 decreasing horizontals, 1.5dp, Warm Dark `#1E1814` on light bg per logo.png/svg in project root) | Design | `android/app/src/main/res` | **Decided — assets in repo (`logo.png` + `logo.svg`)** |
| 5 | MOBI in MVP vs defer | Product | `parsing/text` scope + picker filter | **Decided — Accepted** (see 8.1) |

---

## 9. What Is Out of Scope for This Doc (Belongs in Later Phases)

- **Cloud sync, auth, multi-device** — `phase-0.md:7` out of scope. Schema is ready for a `syncedAt` column later without migration pain, but no sync code in MVP.
- **Analytics / Crashlytics** — `phase-6.md`. No analytics in MVP per `phase-1.md:5.3`.
- **Detailed CI/CD / release signing steps** — `phase-6.md`.
- **Milestones / team / timeline** — `phase-5.md`.

---

## 10. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | Complete |
| `docs/phase-2.md` | Technical Architecture | **Complete (this doc)** |
| `docs/phase-3.md` | Design Spec — Home/Library | Complete |
| `docs/phase-3-reader.md` | Design Spec — Reader + Menu | Complete |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | Complete |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | Complete |

---

## 11. How to Use This Document

- **Developers / AI Agents:** Scaffold exactly the folder structure in Section 3 and install the stack in Section 1. Respect the import rule (`features/*` do not cross-import). All theme values come from `shared/theme/tokens.ts` (3 palettes per `phase-3.md:8`). Repositories are the only DB access — screens never touch SQLite directly.
- **Designers:** No design in this doc — design truth remains `phase-3.md` + `phase-3-reader.md`. If a design token is missing, add it to `phase-3.md:2` first, then reference it here.
- **All:** If a library in Section 1 must be swapped, update Section 8.1 with date + rationale so the next contributor knows why.
