# Phase 4 — Development Roadmap & Integration Wiring

> **Purpose:** Order the build so every script is connected to something from the day it lands. No feature is built in isolation and left as dead code.
> **Scope:** Documentation ONLY. No implementation code. This doc is the build sequence, the wiring map, and the dead-code policy. Coding belongs in development.
> **Platform:** Android (React Native bare, TypeScript) — per `phase-2.md`
> **Depends on:** `phase-0.md` (scope), `phase-1.md` (content), `phase-2.md` (architecture), `phase-3.md` + `phase-3-reader.md` (design truth)
> **Last Updated:** 2026-09-11

---

## 1. Build Principles (Read Before Any Milestone)

1.  **Integration-first, not feature-first.** Every milestone ends with a runnable app and a user journey that works end-to-end (see Section 4). A screen that cannot be reached by navigation, a repository that is not queried by a hook, or a parser that is not called by Import is dead code — and dead code is not allowed unless it is declared in Section 6 with an expiry milestone.

2.  **Vertical slices, not horizontal layers.** Milestone 2 does not build "all repositories" in isolation. It builds Library vertical slice: `BookCard` + `LibraryScreen` + `BookRepository` + `books` query + navigation entry — all wired together so the user can see a (maybe empty) library and tap a card. The repository is not built "for later" — it is built because `LibraryScreen` needs it *now*.

3.  **Single navigation spine from M1.** `app/src/app/navigation/RootNavigator` is created in M1 and never left disconnected. Every screen added later is pushed onto that spine in the same milestone it is created. If a screen exists, it is reachable.

4.  **Single theme source from M1.** `shared/theme/tokens.ts` (3 palettes per `phase-3.md:2` + `8`) is created in M1. Every UI built later imports from it — no hardcoded colors. Reader per-book theme (`phase-3-reader.md:3.8` scope) and app chrome theme (`phase-3.md:8` scope) are two keys in the same `ThemeProvider`, not two separate systems.

5.  **Single data spine from M1.** `data/db` (SQLite open + first migration) and `data/files/FileStorage` are created in M1. Every feature that reads/writes books/highlights/notes goes through `data/repositories/*`. No screen touches SQLite directly after M1.

If a rule above is broken, the milestone does not pass review.

---

## 2. Milestone Overview (What Ships When)

| Milestone | Name | Duration (solo dev) | User Can Do at Exit |
|-----------|------|---------------------|---------------------|
| **M1** | Scaffold + Spine | Week 1 | Launch app → see Library (empty state) + navigate to placeholder Reader → change Light/Sepia theme and see it apply. DB + navigation + theme are live |
| **M2** | Library Vertical Slice | Week 2–3 | Import a real EPUB/PDF (or see 2–3 samples) → see it as a card in a 5-column grid → search/sort/filter → tap → BookDetails → Open → Reader shows raw text (no annotations yet). Stats widget shows real counts |
| **M3** | Reader Engine (Modes + chrome + progress) | Week 4–6 | Open any imported book → scroll or paginate → change font/size/spacing/theme per-book with live preview → jump via TOC → scrub via progress strip → use fullscreen. Page transitions and orientation work |
| **M4** | Annotations (Bookmark / Highlight / Note / Dictionary) | Week 7–8 | Select text → copy/highlight/note/define → see highlights/notes/bookmarks in their panels → edit/delete/change color → dictionary card + history. All persisted and restored on reopen |
| **M5** | Import & Collections Polish | Week 9 | Import via file picker + Share sheet (single + multi) → see per-file progress and every error in `phase-1.md:3.3` → dedup prompt → create shelves/tags → assign books → delete book with confirmation and cascade |
| **M6** | Read Aloud (TTS) | Week 10 | Toggle Read Aloud from menu or toolbar → mini-player (play/pause/skip/speed/scrub/dismiss) → sleep timer → expanded player + voice picker → background playback with notification → highlight-synced word underline |
| **M7** | Stats & Goals | Week 11 | See daily goal progress, streak, time spent, estimated remaining, and 7-day history graph — all derived from `reading_sessions` that have been recorded since M3 |
| **M8** | Polish, A11y, Perf & Release Prep | Week 12 | 60 FPS @ 1000+ books, <2s cold start, TalkBack + reduced-motion + high-contrast correct, R8 + signing + Play listing assets ready |

> Solo-dev estimate = 12 weeks if milestones are not skipped or reordered. Small team (3) = ~6 weeks by parallelizing M3+M5 after M2. Reordering milestones creates dead code (see Section 6) — avoid it.

---

## 3. Milestone Detail — What Is Built, Where It Plugs In, and How You Know It Is Wired

Each milestone lists **Builds** (new scripts/modules), **Depends On** (what must already be live), **Plugs Into** (where it connects), **Dead Code** (none unless declared), and **Verification** (how you prove it is not dead).

---

### M1 — Scaffold + Spine

**Goal:** The three spines that everything else hangs on are live: navigation, theme, data.

**Builds (new scripts — per `phase-2.md:3` structure):**
- `app/src/app/navigation/RootNavigator.tsx` + `app/src/app/providers/*` (ThemeProvider, DatabaseProvider, SafeArea)
- `app/src/shared/theme/tokens.ts` (3 palettes: Light, Neutral Dark, Warm Dark per `phase-3.md:8` — with `warmDark` values) + `ThemeProvider` + `useTheme` (separate app-chrome vs reading-content scopes per keep-separate decision)
- `app/src/shared/icons/index.ts` (re-export from `lucide-react-native` per `phase-2.md:3` rules)
- `app/src/shared/ui/*` primitives used by every later milestone: Card, Button, Sheet (bottom sheet base), Slider, Toggle, SegmentedControl, Pill — each reads from `tokens.ts`, no hardcoded colors
- `app/src/data/db/*` (SQLite open, `migrations/001_initial.ts` creating `books`, `chapters`, `bookmarks`, `highlights`, `notes`, `reading_progress`, `reading_sessions`, `shelves`, `book_shelves`, `dictionary_history`, `settings` per `phase-2.md:5.1`)
- `app/src/data/repositories/BookRepository.ts` (minimal for M1: `list()`, `count()` — enough for Library empty state)
- `app/src/data/files/FileStorage.ts` (stubbed for M1: `getAppPrivateDir()` — real copy/hash in M5)
- Placeholder screens to prove navigation: `features/library/screens/LibraryScreen.tsx` (empty state per `phase-3.md:5.4`), `features/reader/screens/ReaderScreen.tsx` ("No book selected" placeholder), `features/details/BookDetailsScreen.tsx` (placeholder)
- `assets/samples/` (2–3 public-domain EPUBs per `phase-1.md:4` copied into bundle, not yet imported into DB — import happens in M2)
- `.github/workflows/ci.yml` (lint + typecheck + test + assembleRelease)

**Depends On:** Nothing — this is the root. Requires `phase-2.md:1` stack choices to be installed (`package.json`).

**Plugs Into:**
- `RootNavigator` is the root component mounted in `App.tsx` → every later screen is a new route pushed onto this navigator in its milestone — no orphan screens.
- `ThemeProvider` wraps `RootNavigator` → every `shared/ui` primitive and every feature screen reads `useTheme()` from day one. Changing Light→Sepia in M1 proves the token pipeline is live.
- `DatabaseProvider` wraps `RootNavigator` → every later `*Repository` imports the same `getDb()` handle — no second DB open.
- `shared/icons` is the single import path for Lucide — every later file imports from here, so a pack swap is one file.

**Dead Code:** None. Every file created in M1 is rendered or imported by `App.tsx`/`RootNavigator` on launch.

**Verification (run after M1):**
- Launch app → Library empty state ("Your shelf is empty" + Import CTA per `phase-3.md:5.4`) is visible — proves `LibraryScreen` is mounted via `RootNavigator`.
- Tap placeholder Import → navigates to placeholder Reader → Back returns to Library — proves navigation spine.
- Toggle Light→Sepia in a temporary debug switch (removed after M3 ThemePanel lands) → Library background `bg-primary` shifts `#F0EDE6`→`#F0EDE6` (same) and a test card `bg-card` `#FFFFFF` stays white — proves `tokens.ts` + `ThemeProvider` wiring. No hardcoded hex in `LibraryScreen` (grep check).
- Query `SELECT name FROM sqlite_master` → 11 tables exist — proves `001_initial` migration ran.

---

### M2 — Library Vertical Slice

**Goal:** Real books are visible and navigable. Library is no longer empty.

**Builds:**
- `features/library/components/` — `BookCard`, `BookGrid` (5-column `FlatList` + `FastImage` per `phase-2.md:2`), `ContinueReadingCard`, `StatsWidget` (Reading Goals + Bookmarks mini cards per `phase-3.md:3.6`), `SearchBar`, `FilterSheet` (sort/filter per `phase-3.md:3.5`)
- `features/library/hooks/` — `useLibraryBooks` (React Query `['books', sort, filter, search]`), `useLibrarySearch`, `useLibrarySort`
- `features/library/store/libraryStore.ts` (Zustand: `sort`, `filter`, `searchQuery`)
- `features/details/BookDetailsScreen.tsx` (real: cover, title/author, meta, shelf assign, Open button per `phase-3.md` Book Details)
- Extend `BookRepository` → `search()`, `sort()`, `filter()`, `upsert()`, `delete()` + `ProgressRepository` (read `reading_progress` for % per card)
- `parsing/epub` + `parsing/pdf` + `parsing/text` minimal for Library only: `extractMetadata(file) → { title, author, coverBlob, pageCount }` (full chapter parse deferred to M3)
- `data/files/FileStorage` minimal: `extractCover()` helper used by `BookCard`

**Depends On:** M1 (RootNavigator, ThemeProvider, DB, repositories shell, icons, ui primitives).

**Plugs Into:**
- `LibraryScreen` → `useLibraryBooks` → `BookRepository.list()` → `books` table (M1) → renders `BookGrid` → `BookCard` reads `FastImage` cover from `FileStorage` + progress from `ProgressRepository` — full Library→DB→UI loop is closed in this milestone. No repository is built "for later" — each method is called by a hook that is called by a screen that is mounted in `RootNavigator` (M1).
- `BookCard` tap → `navigation.navigate('BookDetails', { bookId })` (route added to `RootNavigator` in this milestone) → `BookDetails` → Open → `navigation.navigate('Reader', { bookId })` — navigation spine grows but stays connected.
- `SearchBar` + `FilterSheet` write to `libraryStore` → `useLibraryBooks` re-queries — state→query wiring proven without a separate "state demo" screen.
- The 2–3 bundled samples are imported into `books` on first launch (one-time seed) so a fresh install shows cards and the StatsWidget reads real `SELECT COUNT(*) FROM books` counts — no mock data path that bypasses the DB.

**Dead Code:** None. If a parser helper (e.g., MOBI) is not needed for the library card, it is not built until M3/M5 — not left as unused file.

**Verification:**
- Fresh install → Library shows 2–3 sample cards with real covers (not placeholders) + "5 columns" label per `phase-3.md:3.5` — proves seed + `extractMetadata` + `BookCard` wiring.
- Import a new EPUB via temporary debug Import button (real picker lands in M5, but M2 seeds a file via `FileStorage` to prove the loop) → new card appears without restart — proves `useLibraryBooks` invalidation.
- Type a query in SearchBar → grid filters in < 300ms — proves `libraryStore`→query wiring.
- Tap card → BookDetails shows same title/author/cover — proves navigation param passing, not a second query.

#### M2 Addendum — Library Search Enhancement (FTS5, Recents, Facets) — Added 2026-09-11

> **Additive only.** Supplements `M2` without changing goal (`Library Vertical Slice`) or creating dead code. Implements `phase-3.md:3.9` + `phase-2.md:5.1.1`/`6.1`. No new milestone, no reordering (see `7` guardrails).

**Additional Builds in M2 (same milestone, same branch):**

- `db/migrations/002_fts.ts` — creates `books_fts` virtual table + `books_ai/ad/au` triggers + `book_shelves` triggers, backfills from `books`. Forward-only per `phase-2.md:5.1` migration rule. WAL already enabled in `001_initial`.
- Extend `data/repositories/BookRepository.ts` — `search(query: string, facet: 'all'|'title'|'author'|'genre'|'shelf', limit?: number)` → `ftsPrefixQuery` sanitizer + `MATCH` + `bm25` per `phase-2.md:5.1.1`. `libraryStore.searchQuery` + new `libraryStore.searchFacet` (default `all`) drive React Query key `['books', sort, filter, searchQuery, searchFacet]`. Keeps `list()` for empty query path.
- Extend `data/repositories/ShelvesRepository.ts` — on assign/remove, update `books_fts.shelfNames` for that `bookId` (denormalized join) so `shelf:Dune*` stays fresh.
- Add `data/repositories/SearchHistoryRepository.ts` (or `settings` key `searchHistory`) — caps at `10` (like `dictionary_history` capped 50 per `phase-2.md:5.1`), `add(query)`, `list()`, `clear()`. Local-only per `phase-1.md:5.3`.
- `features/library/screens/SearchScreen.tsx` — new `native-stack` route `LibraryStack/Search` per `phase-2.md:4` (`Library → Search` push). Composes: header `SearchBar` + facet chips row + results `BookGrid` (reuse `BookCard` + `FastImage`) + recents/suggestions/empty states per `phase-3.md:3.9.3`. **Not a new isolated app** — reuses `SearchBar` from `M2` builds (`features/library/components/SearchBar.tsx`) as single component rendered in two places (Library header pill and Search header field) — same props, same `tokens.ts`.
- `features/library/hooks/useLibrarySearch.ts` — wraps debounce `150ms` + `seq` stale-cancel per `phase-2.md:6.1`, threshold `<2 chars` → show recents. Called by both `LibraryScreen` pill and `SearchScreen` header (same hook, same `libraryStore`).
- `features/library/components/FacetChips.tsx` — horizontal `Pill` row `All | Title | Author | Genre | Shelf` (`phase-3.md:3.9.2`), writes `libraryStore.searchFacet`, re-triggers `useLibraryBooks`.

**Plugs Into:**

- `LibraryScreen` TopNav pill (`phase-3.md:3.3`) → `navigation.navigate('Search')` — route added in `RootNavigator` in same `M2` commit, so no orphan screen (per `1` Single navigation spine). Library position retained via cache.
- `SearchScreen` → `useLibraryBooks` → `BookRepository.search()` → `books_fts` (from `002_fts`) → `BookGrid` — full `Library→DB→UI` loop with relevance ranking. `SearchHistoryRepository.add()` on submit (tap suggestion or keyboard Search) → recents.
- Facet chips + existing `FilterSheet` (shelf/status) compose: `searchFacet` (`title`/`author`/etc) + `filter` (shelf/status) both in `['books', sort, filter, searchQuery, searchFacet]` key. Shows `shelf:theology` narrowing after free-text `dune`.
- Tap result `BookCard` → `BookDetails` (`bookId`) already wired in `M2` — no new navigation.

**Dead Code:** None. Every file added is imported by `SearchScreen` or `RootNavigator` and thus reachable from `App.tsx`. `SearchScreen` is not built in isolation — it is pushed onto the live spine.

**Verification (run after M2, additive to existing M2 verification):**

- Type `dune` in Library pill → debounced `~150ms` → grid shows `Dune 12%` + `Dune Messiah` ranked by `bm25`, title `dune` bolded — proves `ftsPrefixQuery` → `books_fts` → highlight.
- Change facet to `Author` → same query `dune` → `Dune` (author Frank Herbert) stays, title-only `Dune` without author match drops — proves column filter `author:dune*`.
- Type `a` (1 char) → no FTS query, shows `Recent searches` — proves `<2` threshold.
- Clear field → recent `dune` chip tap → fills and re-searches — proves `SearchHistoryRepository`.
- Type `-` or `"` alone → no crash, shows clear hint — proves sanitization prevents `fts5: syntax error near "-"`.
- Search `theology` (shelf name) with facet `Shelf` → books assigned to Theology shelf appear — proves `shelfNames` denormalization trigger.

---

### M3 — Reader Engine (Modes + Chrome + Progress)

**Goal:** Opening a book actually lets you read it.

**Builds:**
- `features/reader/screens/ReaderScreen.tsx` (real, replaces placeholder — layout per `phase-3-reader.md:3.1` Full Screen Layout, with M1 `RootNavigator` mount already in place)
- `features/reader/menu/RectangularMenu.tsx` + `MenuItem.tsx` + `menuStore.ts` (56↔220 slide, collapsed/expanded states per `phase-3-reader.md:2` + `5`)
- `features/reader/toolbar/ReadingToolbar.tsx` (per `phase-3-reader.md:3.2`)
- `features/reader/modes/` — `ScrollMode`, `PaginateMode`, `FullscreenController`, `PageTransition` (Slide/Fade/Curl/None per `phase-3-reader.md:3.3`)
- `features/reader/panels/TOCPanel` (per `phase-3-reader.md:3.5`), `Panels/PagesGrid` (Item 8), `Panels/ProgressSheet` stub (full sheet lands in M7, but strip/scrubber live here)
- `features/reader/hooks/` — `useReaderPosition` (scrollOffset/page index, debounced `reading_progress` write), `useProgress` (reads `reading_progress` + `reading_sessions`)
- Extend `parsing/*` → full `parseChapters()` + `paginate()` + `rawTextPerChapter` for TTS/search (M4/M6 depend on this output per `phase-2.md:7`)
- `data/repositories/ChapterRepository` + extend `ProgressRepository` (`updatePosition()`, `getProgress()`), `reading_sessions` write on open/close

**Depends On:** M1 (navigation, theme scopes, DB), M2 (`BookRepository`, `ChapterRepository` shell, `FileStorage`, navigation param `bookId` from Library→Details→Reader).

**Plugs Into:**
- Reader is opened two ways, both already wired in M2: `BookDetails → Open` and `ContinueReadingCard → Resume` (per `phase-3.md:3.4` RESUME button). M3 replaces the placeholder reader content — the routes already exist, so no new navigation entry is orphaned.
- `ReaderScreen` reads `bookId` param → `BookRepository.get(bookId)` + `ChapterRepository.list(bookId)` + `parsing/*` → renders `ScrollMode` or `PaginateMode` inside the reading viewport bounded by menu + toolbar per `phase-3-reader.md:3.1`. The reading viewport is not a new isolated component — it is the same screen that already had the menu/toolbar mounts from M2's placeholder.
- `TOCPanel` and `PagesGrid` read `chapters` + `reading_progress.currentChapterId` — they are opened from two already-wired triggers: menu Item 1 (BookOpen) and toolbar chapter/page taps (per `phase-3-reader.md:3.2` + `3.5`). No panel is built that cannot be opened.
- `useReaderPosition` writes `reading_progress` (debounced 500ms) and `reading_sessions` (on open/close) → `ProgressRepository` → `LibraryScreen` StatsWidget (`3.6`) reads the same `reading_progress` table, so Library progress bars update without a manual refresh — cross-feature DB wiring proven in this milestone, not deferred to M7.
- Theme/Font controls live-preview (`phase-3-reader.md:3.8`): the panel (built here or in M4 if split) writes `readerStore.theme` (per-book) and reading viewport re-renders with new `tokens` reading-content scope — app chrome (`phase-3.md:8`) is untouched per keep-separate rule. This proves the two-scope `ThemeProvider` from M1.

**Dead Code:** None. The only deferred UI is annotation inline (`3.4`) — not built yet, so no picker/sheet is left unconnected. If `ThemePanel` is split into M4, the split is documented and `FullscreenController` still lands in M3 because it controls layout per `phase-3-reader.md:3.1`.

**Verification:**
- Open a sample EPUB from Library → Reader shows reflowed text with correct font/size, not a WebView placeholder — proves `parsing/epub` → `ScrollMode` wiring.
- Toggle Sepia→Warm Dark in ThemePanel → reading background `#F0EDE6`→`#1E1814` live, menu stays `bg-card-dark` — proves per-book scope separation.
- Scroll halfway, close reader, reopen same book → position restored — proves `useReaderPosition` → `reading_progress` → read-back.
- Open TOC → current chapter has left accent + `bg-primary` per `phase-3-reader.md:3.5` → tap chapter 3 → viewport jumps — proves TOC→position wiring.
- Drag progress strip thumb (`phase-3-reader.md:3.10.2`) → `"42 / 312"` label follows thumb → release → navigates — proves strip→position wiring.

---

### M4 — Annotations (Bookmark / Highlight / Note / Dictionary)

**Goal:** The inline layer that appears over the text is fully functional and persisted.

**Builds:**
- `features/reader/annotations/` — `SelectionToolbar` (`phase-3-reader.md:3.4.2`), `HighlightPicker` (`3.4.3`), `NoteSheet` (`3.4.4`), `BookmarkButton` (`3.4.5`)
- `features/reader/panels/` — `HighlightsPanel` (Item 3), `NotesPanel` (Item 4), `BookmarksPanel` (Item 2), `DictionaryCard` (Item 11) + `SearchSheet` (Item 6) if deferred from M3
- `features/reader/panels/ThemePanel` if deferred from M3 (completes `phase-3-reader.md:3.8`)
- `data/repositories/` — `HighlightRepository`, `NoteRepository`, `BookmarkRepository`, `DictionaryHistoryRepository`
- `shared/ui` extension: highlight rendering (background at 85% per `phase-3-reader.md:3.4.3`)

**Depends On:** M3 (Reader viewport, text selection, reading position, `parsing` output `rawTextPerChapter` for search/highlight ranges). M1 (DB tables already exist — no new migration needed for this milestone).

**Plugs Into:**
- `SelectionToolbar` is not a screen — it is triggered by `ReaderScreen`'s `onSelection` handler (long-press / double-tap per `phase-3-reader.md:6 #12–14`). Its 5 buttons call directly into this milestone's repositories: Copy → clipboard, Highlight → `HighlightRepository.create()` + `HighlightPicker`, Note → `NoteSheet` → `NoteRepository.create()`, Define → `DictionaryHistoryRepository` + `DictionaryCard`, Share → system sheet. No button is stubbed — each is wired to a repository that writes to the same DB opened in M1.
- `HighlightPicker` replaces `SelectionToolbar` buttons in the **same** pill container — it is not a second overlay. Tapping a color writes `HighlightRepository.create({ color, range })` and the highlight is rendered in the reading viewport via `highlights` query invalidation — `ReaderScreen` re-renders with new background, proving highlight→DB→UI loop without a manual refresh.
- `BookmarkButton` (`3.4.5`) toggles `BookmarkRepository.toggle(bookId, page)` and the same row is read by `BookmarksPanel` (menu Item 2) and `ReadingToolbar` bookmark icon (`3.2 #4`) — three UIs, one table, one repository. Tapping in one updates the other two on next render via React Query invalidation — cross-component wiring proven by this sharing, not by duplicating state.
- `NoteSheet` (bottom sheet `3.4.4`) is opened from two already-wired paths: `SelectionToolbar → Note` and `NotesPanel FAB → Plus` (`phase-3-reader.md:2.4 Item 4`). It reads/writes `NoteRepository` + optionally `HighlightRepository` (color dots when attached). It is not a standalone screen — it is mounted inside `ReaderScreen` and dismissed by drag/Back per `phase-3-reader.md:3.4.4`.
- Panels `HighlightsPanel`, `NotesPanel`, `BookmarksPanel` are opened from `RectangularMenu` items 2–4 (`phase-3-reader.md:2.4`) — the menu was live in M3, so no new entry points are orphaned. Each panel reads its repository via React Query and navigates back into the viewport on item tap (e.g., tap highlight → `useReaderPosition.scrollTo(highlight.range)`), proving panel→reader wiring.

**Dead Code:** None. If `SearchSheet` was deferred, it lands here and is wired to menu Item 6 + `rawTextPerChapter` search index — not left as an unmounted component.

**Verification:**
- Long-press a sentence → pill `Copy | Highlight | Note | Define | Share` appears above selection — proves `ReaderScreen.onSelection → SelectionToolbar`.
- Tap Highlight → Yellow → sentence gets `#FFEB3B` at 85% — proves `HighlightPicker → HighlightRepository → ReaderScreen` re-render.
- Open menu → Highlights → that same sentence appears in Yellow section — proves `HighlightsPanel` reads same table.
- Long-press the saved highlight → `Change color + Trash2` row appears (editing mode per `3.4.3`) — proves edit path shares same picker.
- Tap BookmarkButton → filled state + toast + haptic per `3.4.5` → menu → Bookmarks → new row appears — proves single-table sharing.
- Add a note from toolbar Pencil → sheet with anchor snippet + Save → menu → Notes → note appears → tap note → scrolls to anchor — proves `NoteSheet → NoteRepository → viewport`.

---

### M5 — Import & Collections Polish

**Goal:** The file actually gets into the app by the user's hand, not just via seeded samples.

**Builds:**
- `features/import/` — `ImportFlow` (`FilePicker` via SAF `ACTION_OPEN_DOCUMENT` per `phase-1.md:6.1`, Share-sheet receiver `ACTION_SEND` per `6.2`, per-file progress rows, error rows per `phase-1.md:3.3` with exact titles/bodies/actions)
- Extend `data/files/FileStorage` → `copyToAppPrivate()`, `computeHash()` (streaming SHA-256), `checkDuplicate()` per `phase-1.md:3.2`
- Extend `parsing/*` → DOCX "coming soon" placeholder branch per `phase-1.md:3.1`, password/corrupt/empty guards per `phase-1.md:3.3`
- `features/library/store` + `shelves` UI — shelf creation, assign/remove per `phase-3.md:3.5` Book Collection + `BookDetails` shelf row, `ShelvesRepository` + `book_shelves` join
- `features/library` empty-state CTA per `phase-3.md:5.4` ("Import a book") now wired to `ImportFlow`, not a stub

**Depends On:** M2 (Library grid + `BookRepository`), M3 (Reader to prove imported file actually opens), M1 (`FileStorage` stub, DB tables).

**Plugs Into:**
- Import is not a separate "import app" — it is triggered from **three** already-wired entry points, all built earlier: Library header Import button + Library empty-state CTA (both `phase-3.md:3.3`/`5.4` and mounted in M2) and the system Share sheet (global, not a screen). All three call the same `ImportFlow.import(files)` → `FileStorage.copyToAppPrivate()` → `parsing/extractMetadata()` → `BookRepository.upsert()` → React Query `['books']` invalidated → `LibraryScreen` grid shows new `BookCard` without restart. The seeded samples used the same `BookRepository.upsert()` path in M2, so Import does not create a parallel DB path.
- Dedup prompt ("Already in library" per `phase-1.md:3.3`) offers Open Existing (→ `BookDetails` for that `bookId`, already mounted in M2) vs Import Anyway (→ second `books` row with same hash) — both actions use existing navigation targets, no orphan alert.
- Shelf/tag UI writes `shelves` + `book_shelves` via `ShelvesRepository` and is read by Library `FilterSheet` (M2) and `BookDetails` shelf row (M2) — the filter that already existed now has real data to filter by, proving Library→shelves wiring without a new screen.
- Delete book (swipe/long-press per `phase-1.md:6.3`) confirms "Delete [Title]? Highlights and notes will also be removed." → deletes `books` row → cascades to `chapters`/`bookmarks`/`highlights`/`notes`/`reading_progress`/`reading_sessions` (FK cascade from `phase-2.md:5.1`) → `FileStorage` deletes `books/{id}` + `covers/{id}` → grid removes card via query invalidation. No orphan files left on disk.

**Dead Code:** None. MOBI is **accepted** (`phase-2.md:8.1`) — picker includes `application/x-mobipocket-ebook` and `parsing/text` handles it as EPUB subset (best-effort). DOCX branch is not dead — it is a *user-visible* placeholder ("DOCX import coming soon" per `phase-1.md:3.1`), not an unreachable `docxParser.ts`.

**Verification:**
- Tap Library Import → system picker → select an EPUB → per-file progress row → new card appears — proves `FilePicker → FileStorage → BookRepository → LibraryScreen`.
- Share a PDF from Chrome → Share → app → same progress row → card appears — proves Share-sheet receiver shares the same pipeline.
- Re-import same file → dedup alert → Open Existing → lands on that book's details — proves `checkDuplicate` + navigation sharing.
- Create shelf "Theology", assign two books → Library FilterSheet → filter by Theology → only those two remain — proves `shelves`→filter wiring.

---

### M6 — Read Aloud (TTS)

**Goal:** The book can be listened to, not just read.

**Builds:**
- `tts/` — `TtsEngine` (wraps `react-native-tts` + Android `TextToSpeech`), `TtsQueue` (sentence queue from `parsing` `rawTextPerChapter`), `TtsHighlightSync` (sentence highlight + word underline per `phase-3-reader.md:3.9`), foreground service + notification per `phase-3-reader.md:3.9` table
- `features/reader/toolbar/TTSMiniPlayer.tsx` (per `phase-3-reader.md:3.9` 7-element mini-player)
- `features/reader/panels/TTSExpandedPlayer` (scrubber + voice picker + sleep timer per `phase-3-reader.md:3.9`)
- `features/reader/panels/TTSSettings` (voice, highlight-sync toggle, background playback toggle per `phase-3-reader.md:3.9` table)
- Extend `settings` table usage: `ttsVoice`, `ttsRate`, `ttsSleepTimer`, `ttsHighlightSync`

**Depends On:** M3 (reading position + `rawTextPerChapter` to build sentence queue), M1 (`settings` table, notification permission), M4 (highlight rendering reused for TTS highlight at 60% vs saved 85% distinction per `phase-3-reader.md:3.9`).

**Plugs Into:**
- TTS is toggled from `RectangularMenu` Item 5 (Volume2) — the menu item already exists in M3. Tapping it sets `ttsStore.isActive` (Zustand) → `ReaderScreen` mounts `TTSMiniPlayer` stacked on `ReadingToolbar` per `phase-3-reader.md:3.9` (combined chrome, no gap). The mini-player is not a new screen — it is chrome that appears inside the same `ReaderScreen` that already hosts the toolbar, so no new route is orphaned.
- `TTSMiniPlayer` progress scrubber shares the same `useReaderPosition` channel as the progress strip (`3.10`) — scrubbing TTS seeks the queue and vice versa. Speed control writes `settings.ttsRate` and `TtsEngine.setRate()` immediately.
- `TtsHighlightSync` reuses `ReaderScreen`'s highlight rendering path from M4, but at 60% vs 85% opacity so saved vs spoken highlights are visually distinct — one render path, two sources, proven by selecting text while TTS is speaking (saved highlight stays 85%, spoken sentence is 60% with moving underline).
- Sleep timer (End of chapter / 15/30/60/Custom per `phase-3-reader.md:3.9`) is set from `TTSExpandedPlayer` and counts down in the same `TtsEngine` — no separate timer service.
- Background playback notification is shown only when `settings.ttsHighlightSync.backgroundPlayback` is on (toggle per `phase-3-reader.md:3.9` table) — otherwise TTS pauses on background and resumes on foreground, which is tested per that table.

**Dead Code:** None. If background playback is not yet fully implemented by the end of M6, the toggle exists but is **disabled with helper text** "Background playback coming soon" — not an enabled switch that writes a setting no service reads. The disabled state is declared below as allowed temporary dead UI, not dead code that silently does nothing.

**Verification:**
- Open a chapter → menu → Volume2 → speech starts from current viewport top + mini-player slides up — proves menu→engine→mini-player + queue from `rawTextPerChapter`.
- Drag TTS scrubber thumb → spoken position jumps — proves scrubber→queue wiring.
- Enable "Highlight spoken word" → sentence highlighted at 60% + moving underline + auto-scroll to middle third — proves sync + scroll wiring per `phase-3-reader.md:3.9`.
- Background the app with background playback on → notification shows "Book Title · Chapter 3" + play/pause/skip/dismiss → tap pause in notification → speech pauses — proves service wiring.
- PDF scanned page → Volume2 disabled at 40% + VolumeX icon — proves `hasTextLayer` guard per `phase-3-reader.md:3.9` table.

---

### M7 — Stats & Goals

**Goal:** Reading history becomes visible — Library StatsWidget and Progress sheet show real numbers, not placeholders.

**Builds:**
- `features/library/components/StatsWidget` full implementation (Reading Goals + Bookmarks cards per `phase-3.md:3.6` with real `reading_sessions` + `reading_progress` data)
- `features/reader/panels/ProgressSheet` full implementation (ring + 4-cell grid + Daily Goal card + Estimated Remaining + 7-day mini-graph per `phase-3-reader.md:3.10.3`)
- `data/repositories/ReadingSessionsRepository` + queries for streak, daily goal, history per `phase-2.md:5.1`
- Extend `settings` usage: `dailyReadingGoal` (e.g., 30 min/day per `phase-3.md:3.6` "38 min/day"), `goalReminderTime` if needed

**Depends On:** M3 (`reading_sessions` have been written on every open/close since M3, so by M7 the table has real history to graph). M1 (`settings`, `reading_progress` tables).

**Plugs Into:**
- `StatsWidget` (already rendered in Library since M2) was showing placeholder "38 min/day" — now it reads `ReadingSessionsRepository.todayMinutes()` + `StreakRepository` and the `3 active / Chapter 14 / 212 / Note 5` counts from `BookmarkRepository`/`HighlightRepository`/`NoteRepository` (M4) — the widget was mounted since M2, so wiring it to real queries proves Library→sessions wiring without a new screen.
- `ProgressSheet` (bottom sheet per `phase-3-reader.md:3.10.3`) is opened from menu Item 9 (BarChart3) — already exists in M3 — and from the progress scrubber label tap per `phase-3-reader.md:3.10.2`. It reads `reading_progress` (current) + `reading_sessions` (history) + `settings.dailyReadingGoal` — three tables, one sheet, proving DB→sheet wiring.
- Streak and history graph are **not** computed in the sheet — they are computed in `ReadingSessionsRepository.getStreak()` / `getLast7Days()` and consumed by both `StatsWidget` and `ProgressSheet`, so both UIs share the same source.

**Dead Code:** None. If daily-goal reminder notifications are deferred beyond MVP, the `goalReminderTime` setting is simply not added in this milestone — not left as a stored key with no scheduler.

**Verification:**
- Read a book for 6 minutes → close → reopen Library → StatsWidget shows "6 min today" (not the M2 placeholder 38) — proves `reading_sessions`→widget.
- Open Progress sheet → ring animates 0→current (600ms), 4-cell grid shows Pages Read / Time Spent / Chapters Completed / Days Reading with `Flame` + streak — proves sheet reads three tables.
- Change daily goal in Settings → ring + goal card update without restart — proves `settings`→sheet/widget sharing.

---

### M8 — Polish, A11y, Perf & Release Prep

**Goal:** The app feels premium and passes Play review.

**Builds:**
- A11y pass: `TalkBack` labels per `phase-3-reader.md:8`, `Dynamic Type` respect, high-contrast checks, Switch Access ordering, keyboard nav for `NoteSheet` (`phase-3-reader.md:3.4.4`), reduced-motion branches (`phase-3-reader.md:5.3` → instant instead of slide) — all inside existing components, no new screens
- Perf pass: `FlatList` `getItemLayout` + `windowSize` + `FastImage` cache for Library (`phase-2.md:2`), pagination laziness for 1000+ virtual pages (`phase-3-reader.md:3.3`), `R8` + `hermesEnabled` already from M1 — verify with release build
- Dark mode app chrome (Warm Dark palette per `phase-3.md:8`) toggle in app Settings → `ThemeProvider` app-chrome scope — reading themes already per-book since M3 per keep-separate decision (`phase-3.md:8` note + `phase-3-reader.md:3.8` scope)
- App icon + splash + Privacy Policy + Terms links (per `phase-1.md:5.3/5.4`) in `Settings → About` + Play listing copy (per `phase-1.md:5.5` accuracy rule)
- Release signing, `assembleRelease`, ci green on release, manual smoke on 3 devices / 3 Android versions (Samsung, Pixel, Xiaomi per `phase-0.md` device-testing note)

**Depends On:** All of M1–M7 — this milestone touches every layer but adds no new feature.

**Plugs Into:**
- Every change is inside already-wired components — no new routes, no new tables, no new repositories. A11y labels are added to `MenuItem`, `SelectionToolbar`, `NoteSheet`, `TOCPanel`, `ProgressSheet` that already exist; perf tweaks are props on existing `FlatList`/`PdfView`; dark app chrome reuses `tokens.ts` palettes already in `ThemeProvider` since M1.

**Dead Code:** None — by definition this milestone deletes or connects any remaining stub, not adds new files.

**Verification (release exit gate):**
- `ci.yml` green: lint + typecheck + Jest + `assembleRelease`.
- Cold start < 2s on mid-range device, Library 60 FPS with 1000 books (M2 seed duplicated to 1000), highlight/note survive kill-and-reopen.
- TalkBack linear navigation covers Library→Details→Reader→menu→toolbar→sheets in DOM order per `phase-3-reader.md:8`.
- Play Console `privacyPolicyUrl` resolves and Privacy copy matches `phase-1.md:5.3` draft (human-reviewed).

---

## 4. User Journeys That Must Stay Green After Every Milestone

If any journey below is broken after a milestone, that milestone is not done — regardless of whether its individual screens look correct. These are the integration tests (manual in M1–M4, automated with Maestro/Detox from M5 onward).

| # | Journey (start → end) | Must Work After | Proves Wiring |
|---|-----------------------|-----------------|---------------|
| J1 | Launch → Library empty state → (after M2) see samples | M1, still in M2–M8 | RootNavigator + LibraryScreen + DB seed |
| J2 | Library → tap card → BookDetails → Open → Reader shows text → Back → Library | M2 (text via M3 full) | Library → Details → Reader navigation spine |
| J3 | Reader → change font/theme (live preview) → close → reopen → theme restored per-book | M3 | ThemeProvider per-book scope + persistence |
| J4 | Reader → scrub progress strip or TOC or PagesGrid → position changes → close → reopen → position restored | M3 | `useReaderPosition` ↔ `reading_progress` |
| J5 | Reader → long-press → highlight → menu → Highlights → tap → scrolls to highlight | M4 | SelectionToolbar → HighlightRepository → HighlightsPanel → Reader |
| J6 | Reader → bookmark → menu → Bookmarks → tap → scrolls to page | M4 | BookmarkButton ↔ BookmarkRepository ↔ BookmarksPanel |
| J7 | Reader → select → Note → save → menu → Notes → tap → opens NoteSheet with anchor | M4 | NoteSheet ↔ NoteRepository (+ highlight link) ↔ NotesPanel |
| J8 | Reader → tap word → Dictionary card + history capped at 50 | M4 | DictionaryCard + DictionaryHistoryRepository |
| J9 | Library → Import via picker or Share sheet → new card appears → Open → readable | M5 | FilePicker/Share → FileStorage → parsing → BookRepository → Library → Reader |
| J10 | Library → create shelf → assign book → filter by shelf → delete book → cascade deletes highlights/notes/bookmarks + removes files | M5 | Shelves + cascade FK per `phase-2.md:5.1` |
| J11 | Reader → Read Aloud → mini-player → scrub/skip/speed → sleep timer fires → highlight sync follows word | M6 | TTS engine → queue → mini-player → highlight sync |
| J12 | Library StatsWidget + Reader ProgressSheet show real goal/streak/history | M7 | reading_sessions → StatsWidget + ProgressSheet |

---

## 5. Master Integration Map — Every Script Knows Its Two Neighbors

Every script must have at least one **provider** (what it consumes) and one **consumer** (what consumes it). If either column is empty, it is dead code and must be explained in Section 6.

| Script / Module | Provides To Consumer | Consumes From Provider | Consumer(s) | Verified By Journey |
|-----------------|----------------------|------------------------|-------------|---------------------|
| `tokens.ts` + `ThemeProvider` (M1) | Colors/spacing/typography + app-chrome vs reading-content scopes | — (source of truth) | Every `shared/ui/*`, `LibraryScreen`, `BookCard`, `ReaderScreen`, `RectangularMenu`, `ReadingToolbar`, `ProgressStrip` | Visual: any screen change via `useTheme()` |
| `DatabaseProvider` + `001_initial` (M1) | SQLite handle + 11 tables | — | Every `*Repository` | `sqlite_master` check (M1) |
| `shared/ui/*` — Card, Button, Sheet, Slider, Toggle, SegmentedControl, Pill (M1) | Reusable chrome used everywhere | `tokens.ts` + `icons` | Every feature screen/panel | No screen builds its own button — grep proves import from `shared/ui` |
| `shared/icons` (M1) | Lucide re-exports | `lucide-react-native` | Every feature | Swap test: change one icon in `shared/icons` → all usages update |
| `RootNavigator` + providers wrapper (M1) | Reachability for every screen | `ThemeProvider` + `DatabaseProvider` | `Library`, `BookDetails`, `Reader` (+ all future routes) | J1–J12 all start with navigation |
| `BookRepository` + `ProgressRepository` base (M1→M2) | `list/search/sort/filter/upsert/delete` + progress % | `DatabaseProvider` + `reading_progress` | `LibraryScreen` (grid), `ContinueReadingCard`, `StatsWidget`, `BookDetails` | M2: Library shows cards from DB, not mocks |
| `FileStorage` base (M1→M2→M5) | `getAppPrivateDir` → `copyToAppPrivate` → `computeHash` → `checkDuplicate` → `extractCover` | `books` table (hash), file system | `ImportFlow`, `BookCard` (cover), `BookRepository` (filePath) | M2: cover appears; M5: dedup prompt |
| `parsing/*` minimal (M2) → full (M3) | `extractMetadata` → `parseChapters` + `paginate` + `rawTextPerChapter` | `books.filePath` | `Library` (cover/title), `Reader` modes, `TOCPanel`, TTS queue, search | M3: Reader shows chapters from parse, not hardcoded |
| `libraryStore` + hooks (M2) | `sort/filter/searchQuery` state + React Query keys | `BookRepository` | `LibraryScreen` → `BookGrid` | M2: FilterSheet typing filters grid |
| `ReaderScreen` + `FullscreenController` (M3) | Reading viewport + chrome visibility | `BookRepository` + `ChapterRepository` + `parsing` + `menuStore` + `readerStore.theme` + `FullscreenController` | `RectangularMenu`, `ReadingToolbar`, `TOCPanel`, `ProgressStrip`, `SelectionToolbar`, `TTSMiniPlayer` | J2–J4 |
| `RectangularMenu` + `menuStore` (M3) | Collapsed/expanded + activeItem + `activePanel` selector | `tokens` (dark `bg-card-dark`) + `reading` state for active highlight | `Library` FAB/menu toggle, `Reader` toolbar menu toggle, all 12 panels/sheets | J4–J6: menu opens every panel |
| `ReadingToolbar` (M3) | Page/chapter/Bookmark/Color/Menu quick access | `reading_progress` + `chapters` + `BookmarkRepository` + `ColorPicker` | `ReaderScreen` chrome (auto-hide) | J6: bookmark toggle in toolbar |
| `ScrollMode` / `PaginateMode` / `PageTransition` (M3) | Rendered book content per mode | `parsing` output + `readerStore.theme` + `margins/spacing` settings | `ReaderScreen` viewport | J3–J4: scroll/paginate both readable |
| `ProgressStrip` + `ProgressScrubber` (M3) | Position scrubbing | `reading_progress` + `chapters` (ticks) | `ReaderScreen` position | J4: drag thumb navigates |
| `TOCPanel` (M3) | Chapter jump | `chapters` + `reading_progress.currentChapterId` | `ReaderScreen` (scrollTo) | J4: tap chapter jumps |
| `PagesGrid` (M3) | Page jump via thumbnails | `books.pageCount` + `reading_progress` | `ReaderScreen` | J4 variant: tap thumbnail jumps |
| `SelectionToolbar` + `HighlightPicker` (M4) | 5 buttons + 6 colors | `ReaderScreen` selection rect + `HighlightRepository` | `HighlightRepository`, `NoteRepository`, `DictionaryHistoryRepository`, clipboard | J5: highlight round-trip |
| `NoteSheet` (M4) | Create/edit notes | `NoteRepository` + optional `HighlightRepository` link | `NotesPanel`, `ReaderScreen` note indicator | J7 |
| `BookmarkButton` (M4) | Toggle + fill state | `BookmarkRepository` + `ReadingToolbar` share | `BookmarksPanel` + `ReadingToolbar` | J6 |
| `HighlightsPanel` / `NotesPanel` / `BookmarksPanel` / `DictionaryCard` / `SearchSheet` (M4) | Lists + detail + navigation back to reader | `HighlightRepository` / `NoteRepository` / `BookmarkRepository` / `DictionaryHistoryRepository` / `rawTextPerChapter` index | `ReaderScreen` (scrollTo highlight/note/page) | J5–J8 |
| `ImportFlow` (M5) | File → Library | `FileStorage` + `parsing` + `BookRepository` + `ChapterRepository` | `LibraryScreen` grid | J9 |
| `ShelvesRepository` (M5) | Shelf CRUD + join `book_shelves` | `shelves` + `book_shelves` | `Library FilterSheet` + `BookDetails` shelf row | J10: filter by shelf |
| `TtsEngine` + `TTSMiniPlayer` + `TTSExpandedPlayer` + `TtsHighlightSync` (M6) | Speech + chrome + word following | `rawTextPerChapter` + `useReaderPosition` + `settings.tts*` | `ReaderScreen` highlight layer + notification | J11 |
| `ReadingSessionsRepository` + goal/streak queries (M7) | `todayMinutes` + streak + history | `reading_sessions` + `reading_progress` + `settings.dailyReadingGoal` | `StatsWidget` + `ProgressSheet` | J12 |
| `StatsWidget` full (M7) | Real counts + goal bar | `ReadingSessionsRepository` + `BookmarkRepository`/`HighlightRepository`/`NoteRepository` | `LibraryScreen` | J12 |
| `ProgressSheet` full (M7) | Ring + 4-cell grid + goal card + history graph | `reading_progress` + `reading_sessions` + `settings` | `Reader` (menu Item 9) | J12 |

> To check for dead code at any milestone: `grep -r "from '@/.*"` each script → every import must be imported somewhere that is itself reachable from `RootNavigator` or `App.tsx`. CI runs a dead-import check from M2 onward (simple script: list files not imported by any other file → fail if not in Section 6 allowlist).

---

## 6. Dead Code Policy

**Rule:** Dead code is not allowed to land. If it must land for sequencing reasons, it is **declared here with a reason and an expiry milestone** when it becomes wired. Undeclared dead code fails review.

**Allowed temporary dead code (declare in PR description + this table):**

| Dead File / Export | Reason It Is Temporarily Dead | Wired In Milestone | What Keeps It Honest |
|--------------------|-------------------------------|--------------------|----------------------|
| Example: `TTSMiniPlayer.tsx` built in M6 but `TtsEngine` native module not yet linked | Mini-player UI can be visually reviewed in Storybook while native module is linked | M6 (same) — not left past one milestone | Disabled state declared — toggle shows "Background playback coming soon" (per M6) instead of a working switch that does nothing |
| Example: `Warm Dark` tokens added in M1 but not selectable in Library Settings until M8 | Tokens must exist from M1 so every component reads from same `tokens.ts` — but Library dark toggle is deferred | M8 — app chrome dark switch | No dead *logic* — just extra palette values in `tokens.ts` that cost nothing and are not branched on |
| — | — | — | — |

**No rows in this table today means no dead code is planned.** Every milestone above was sequenced to avoid it. If a contributor must add a row, include: file path, why it cannot be wired this milestone, the milestone that wires it, and the disabled/hint UI that prevents a user from triggering dead behavior.

**What is not considered dead code:**
- Shared primitives (`shared/ui/*`, `shared/icons`, `tokens.ts`) — they are consumed by every later milestone from day one (see rows in Section 5).
- Migrations and repository shells that are imported by `DatabaseProvider` even if a specific query is not yet called — the file is still imported. A repository file with zero consumers beyond the provider is still wired via the provider.

---

## 7. Sequencing Guardrails

| Guardrail | Why | What Breaks If Violated |
|-----------|-----|-------------------------|
| Do not build Reader before Library can show a real book (M3 before M2) | Reader needs `bookId` + `FileStorage` cover + parsed chapters — without Library's wiring you test Reader with a hardcoded mock that hides DB/file bugs | J2 fails silently — Reader works in demo but crashes on a real imported PDF |
| Do not build Annotations before Reader can render selectable text (M4 before M3) | `SelectionToolbar` depends on `ReaderScreen` selection rect + `parsing` text layer | `HighlightPicker` has no range to save — dead repo |
| Do not build TTS before parsing produces `rawTextPerChapter` (M6 before M3) | `TtsQueue` needs sentence array | `TtsEngine` starts with empty queue — silent "nothing to speak" bug |
| Do not build Stats before sessions exist (M7 before M3) | Streak/history queries need rows in `reading_sessions` | Graph shows zero and looks "not wired" when it is actually starved of data |
| Do not add billing/store/catalog before `phase-1.md` is revised and re-approved | Legal scope change | Play review + copyright risk |

---

## 8. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-11 | Milestones are vertical slices per feature, not horizontal layers | Prevents dead repositories/screens that are built "for later" but never exercised |
| 2026-09-11 | Reader panels are local state, not routes (per `phase-2.md:4`) — therefore every panel is wired the same milestone its trigger is wired | Keeps position/selection alive and makes the wiring visible in one file (`ReaderScreen`) |
| 2026-09-11 | Import lands in M5, not M1/M2, but seeded samples land in M2 via the *same* `BookRepository.upsert()` path | Library is testable from M2 without waiting for the full SAF + Share-sheet pipeline, yet no second DB path is created |
| 2026-09-11 | No dead code without a row in Section 6 + an expiry milestone + disabled UI hint | Forces sequencing honesty and prevents "TODO" files that linger without a consumer |

---

## 9. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | Complete |
| `docs/phase-2.md` | Technical Architecture | Complete |
| `docs/phase-3.md` | Design Spec — Home/Library | Complete |
| `docs/phase-3-reader.md` | Design Spec — Reader + Menu | Complete |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | **Complete (this doc)** |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | Complete |

---

## 10. How to Use This Document

- **Developers / AI Agents:** Do not pick a file to build by looking at `phase-2.md` structure alone — look at **Section 3** milestones in order. Each task is "build this file *because* it plugs into that existing consumer and is verified by that journey." If you cannot name its consumer, it is dead code — do not build it yet or add it to Section 6.
- **Designers:** Journeys J1–J12 in Section 4 are your acceptance tests — if a journey cannot be completed, the feature is not done even if the component matches the Figma.
- **Reviewers:** Check **Section 5** row by row — every script must have both a provider and a consumer. Check **Section 6** is empty or every row has an expiry milestone and a disabled hint. Merge only if J1–J12 for that milestone pass.
