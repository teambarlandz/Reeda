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
| **M8-Ext** | A11y, Perf, Dark Chrome, Settings, PDF Text & Release Hardening | Week 12+ (parallel) | Full TalkBack coverage, reduced-motion, FastImage cache + PagesGrid virtualization, R8 enabled, release signing wired, Settings screen with dark mode toggle + Privacy/Terms, custom icon + splash, CI assembleRelease green, PDF text extraction (embedded + OCR) → TTS + highlights + search work on PDFs |

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

### M8-Extension — A11y, Perf, Dark Chrome, Settings & Release Hardening

> **Additive to M8.** M8 covers the *intent*; this extension covers every gap found during the pre-release audit. No feature is added — every change is inside already-wired components. All items are grouped by area so they can be parallelized across contributors.

**Goal:** Close every accessibility, performance, theming, settings, and release gap so the app is Play-review-ready and passes the M8 verification gate (Section 3, M8).

**Builds (no new screens — all changes are inside existing files):**

#### A — Accessibility (TalkBack, Keyboard, Reduced Motion)

| # | Task | Files Changed | Spec Reference |
|---|------|---------------|----------------|
| A1 | Add `accessibilityLabel` + `accessibilityRole="button"` to every `Pressable`/`TouchableOpacity` in `SelectionToolbar.tsx`, `HighlightPicker.tsx`, `NoteSheet.tsx`, `BookmarkButton.tsx` | `SelectionToolbar.tsx`, `HighlightPicker.tsx`, `NoteSheet.tsx` | `phase-3-reader.md:8` — selection toolbar announces "Copy, Highlight, Add note, Define, Share" |
| A2 | Add `accessibilityLabel` + `accessibilityRole="button"` + `accessibilityState={{ expanded: activeItem === key }}` to every `MenuItem.tsx` entry | `MenuItem.tsx` | `phase-3-reader.md:8` — menu items announce name and state |
| A3 | Add `accessibilityLabel` + `accessibilityRole="adjustable"` to `ProgressStrip` thumb, `TTSMiniPlayer` scrubber, and `Slider` shared primitive | `ProgressStrip.tsx`, `TTSMiniPlayer.tsx`, `shared/ui/Slider.tsx` | `phase-3-reader.md:8` — sliders announce value |
| A4 | Add `accessibilityLabel` + `accessibilityRole="header"` to all panel headers: `TOCPanel`, `HighlightsPanel`, `NotesPanel`, `BookmarksPanel`, `DictionaryCard`, `SearchSheet`, `ThemePanel`, `TTSSettings`, `TTSExpandedPlayer`, `ProgressSheet`, `PagesGrid` | All panel files | `phase-3-reader.md:8` — panels announce title on open |
| A5 | Add `accessibilityLabel` + `accessibilityRole="search"` to `SearchBar` header field and `accessibilityRole="tablist"` / `role="tab"` to `FacetChips` | `SearchBar.tsx`, `FacetChips.tsx` | `phase-3.md:3.9` — search and facet chips |
| A6 | Add `accessibilityLabel` to `FilterSheet`, `ShelvesSheet`, `BookDetailsScreen` action buttons, `ImportFlow` progress rows, `ImportErrorRow` | `FilterSheet.tsx`, `ShelvesSheet.tsx`, `BookDetailsScreen.tsx`, `ImportFlow.tsx`, `ImportErrorRow.tsx` | General a11y — every interactive element must be labelled |
| A7 | Add `accessibilityLabel` + `accessibilityRole="button"` to all `shared/ui` primitives: `Button`, `Card` (if tappable), `Pill`, `Toggle`, `SegmentedControl` | `shared/ui/Button.tsx`, `Card.tsx`, `Pill.tsx`, `Toggle.tsx`, `SegmentedControl.tsx` | Every consumer inherits these — fix once, fix everywhere |
| A8 | Add `KeyboardAvoidingView` wrapper + `keyboardShouldPersistTaps="handled"` + Tab-order (`returnKeyType`, `onSubmitEditing`) + Enter=Save / Escape=Cancel to `NoteSheet.tsx` | `NoteSheet.tsx` | `phase-3-reader.md:3.4.4` — keyboard/external input |
| A9 | Add `AccessibilityInfo` detection: subscribe to `reduceMotionChanged` in `ReaderScreen.tsx` → conditionally disable `PageTransition` animation (use instant instead of slide/curl), disable menu slide animation, disable toolbar auto-hide animation | `ReaderScreen.tsx`, `PageTransition.tsx`, `RectangularMenu.tsx`, `ReadingToolbar.tsx` | `phase-3-reader.md:5.3` — reduced-motion branches |
| A10 | Add `AccessibilityInfo` subscription in `TtsEngine` or `TTSMiniPlayer`: when TalkBack is active, duck TTS volume or pause TTS; resume when TalkBack finishes | `TTSMiniPlayer.tsx` or new hook `useTalkBackDetection.ts` | `phase-3-reader.md:8` — TTS + TalkBack conflict |
| A11 | Add `importantForAccessibility` and `accessibilityElementsHidden` to `PagesGrid` overlay so it does not interfere with TalkBack linear navigation when closed | `PagesGrid.tsx` | `phase-3-reader.md:8` — Switch Access ordering |
| A12 | Add `accessible` + `accessibilityRole="text"` to reading viewport paragraphs in `ScrollMode.tsx` and `PaginateMode.tsx`; announce current page/chapter on page turn via `AccessibilityInfo.announceForAccessibility` | `ScrollMode.tsx`, `PaginateMode.tsx`, `ReaderScreen.tsx` | `phase-3-reader.md:8` — reading content semantics |

#### B — Performance

| # | Task | Files Changed | Spec Reference |
|---|------|---------------|----------------|
| B1 | Add `FastImage.preload()` for book covers in `BookCard` on mount; set `cacheControl: 'immutable'` on all `FastImage` `source` props | `BookCard.tsx`, `BookDetailsScreen.tsx`, `ContinueReadingCard.tsx` | `phase-2.md:2` — FastImage cache |
| B2 | Add `getItemLayout`, `windowSize={5}`, `maxToRenderPerBatch={9}`, `removeClippedSubviews={true}` to `PagesGrid` FlatList | `PagesGrid.tsx` | `phase-3-reader.md:3.3` — pagination laziness for 1000+ pages |
| B3 | Wrap `paginateChapters()` call in `useMemo` in `PaginateMode.tsx` to avoid re-parsing on every render | `PaginateMode.tsx` | Perf — prevent unnecessary re-computation |
| B4 | Enable R8 minification: set `enableProguardInReleaseBuilds = true` in `build.gradle`, add ProGuard keep rules for Hermes, SQLite, FastImage, SVG | `android/app/build.gradle`, `android/app/proguard-rules.pro` | M8 verification — release build must be minified |
| B5 | Wire `build.gradle` release signing config to read from `gradle.properties` (`MYAPP_RELEASE_STORE_FILE`, etc.) so the release workflow secrets are actually consumed | `android/app/build.gradle` | Release signing is currently broken — uses debug key |

#### C — Dark Mode App Chrome + Settings Screen

| # | Task | Files Changed | Spec Reference |
|---|------|---------------|----------------|
| C1 | Create `features/settings/screens/SettingsScreen.tsx` — new `native-stack` route `Settings` pushed from Library header gear icon. Sections: Appearance (dark mode toggle), Reading Goal, About (Privacy, Terms, Content Notice) | New: `features/settings/screens/SettingsScreen.tsx`. Modified: `RootNavigator.tsx`, `LibraryScreen.tsx` | `phase-2.md:5` — Settings screen planned; `phase-4.md:306` — M8 dark toggle |
| C2 | Add `AppThemeToggle` component inside Settings → Appearance section: three-segment control `Light | Neutral Dark | Warm Dark` → calls `setAppTheme()` from `ThemeProvider` context | New: `features/settings/components/AppThemeToggle.tsx` | `phase-3.md:8` — app-chrome vs reading-content scope |
| C3 | Persist `appTheme` choice to `settings` table (`appTheme` key) in `ThemeProvider.tsx` and restore on app launch | `ThemeProvider.tsx`, `SettingsRepository.ts` | `phase-3.md:8` — theme persists across sessions |
| C4 | Add `ReadingGoalRow` in Settings: shows current `dailyReadingGoal`, tap to edit (reuses goal picker pattern from `ProgressSheet`) | `SettingsScreen.tsx` | `phase-3.md:3.6` — 38 min/day goal configurable |
| C5 | Add `AboutSection` in Settings: `Content Notice` (static text per `phase-1.md:5.2`), `Privacy Policy` (link to hosted URL or static text per `phase-1.md:5.3`), `Terms of Service` (link or static text per `phase-1.md:5.4`), `Contact/Support` email | `SettingsScreen.tsx` | `phase-1.md:5.3/5.4` — legal pages |
| C6 | Create Privacy Policy and Terms of Service static screens (or `Linking.openURL` to hosted pages) accessible from Settings → About | New: `features/settings/screens/PrivacyScreen.tsx`, `TermsScreen.tsx` (or inline) | `phase-1.md:5.3/5.4` — in-app legal |

#### D — App Icon, Splash & Branding

| # | Task | Files Changed | Spec Reference |
|---|------|---------------|----------------|
| D1 | Generate custom Reeda Android mipmap icons from existing `assets/logo.svg` / `assets/icon.svg` — replace default RN blue icons across all density buckets | `android/app/src/main/res/mipmap-*/` | Play listing — custom icon required |
| D2 | Add splash screen: install `react-native-splash-screen` (or `react-native-bootsplash`), create splash drawable from `assets/logo.png`, configure in `AndroidManifest.xml` and `MainActivity.tsx` | New: splash assets in `android/app/src/main/res/drawable*/`, modified: `MainActivity.tsx`, `android/app/src/main/res/values/styles.xml` | Cold start < 2s with branded splash |

#### E — CI, Signing & Release

| # | Task | Files Changed | Spec Reference |
|---|------|---------------|----------------|
| E1 | Add `assembleRelease` job to `ci.yml` — runs `./gradlew assembleRelease` on push to `main` to validate release APK compiles | `.github/workflows/ci.yml` | M8 verification — `ci.yml` green on release |
| E2 | Fix release workflow: inject signing config into `gradle.properties` and update `build.gradle` `release` signing block to read those keys (B5 handles Gradle side) | `.github/workflows/release.yml`, `android/app/build.gradle` | Release APK must be signed with release key |
| E3 | Tighten ESLint: re-enable `prettier/prettier`, set `no-unused-vars` to `warn`, set `exhaustive-deps` to `warn` | `.eslintrc.js` | Code quality before release |
| E4 | Add version-bump script: sync `versionCode`/`versionName` in `build.gradle` with `package.json` version | `package.json` (new script), `android/app/build.gradle` | Automated versioning for Play releases |

#### F — PDF Text Extraction & OCR (TTS + Highlights + Search for PDFs)

> **Why:** PDFs currently render as images only — no text layer means TTS disabled, no text selection, no highlights, no search. This section adds a parallel text extraction pipeline that produces `ParsedChapter[]` (same format EPUBs use), so all downstream systems (TTS, highlights, search, pagination) work on PDFs automatically.

**File structure:**
```
parsing/pdf/
  ├── extractText.ts        ← NEW: pdfjs-dist text extraction (embedded text)
  ├── ocrText.ts            ← NEW: ML Kit OCR fallback (scanned/image-only)
  ├── extractMetadata.ts    ← MODIFY: real hasTextLayer detection
  ├── PdfView.tsx           ← MODIFY: pass page images to OCR if needed
  └── pdfToChapters.ts      ← NEW: convert extracted text → ParsedChapter[]
```

| # | Task | Files Changed | Spec Reference |
|---|------|---------------|----------------|
| F1 | Install `pdfjs-dist` (Mozilla PDF.js — JS text extraction engine, ~473 KB / 133 KB gzipped) and `@react-native-ml-kit/text-recognition` (Google ML Kit OCR — native bridge, ~898 B JS + ~2–3 MB native APK) | `package.json` | `phase-1.md:3.1` — PDF support; `phase-5.md:177` — PDF text selection risk |
| F2 | Create `parsing/pdf/extractText.ts` — uses `pdfjs-dist` to load PDF document via `getDocument()`, iterate pages, call `page.getTextItems()` → concatenate into plain-text string per page. Returns `{ pageTexts: string[], hasTextLayer: boolean }` where `hasTextLayer = true` if total extracted text > 200 chars (matching existing heuristic at `ReaderScreen.tsx:113`) | New: `app/src/parsing/pdf/extractText.ts` | PDF.js text layer extraction |
| F3 | Create `parsing/pdf/ocrText.ts` — takes page image URIs (from `react-native-pdf` page render or `FileStorage`), runs `TextRecognition.recognize(imageUri)` from `@react-native-ml-kit/text-recognition` on each page. Returns `{ pageTexts: string[] }`. Includes batch processing with progress callback for large PDFs | New: `app/src/parsing/pdf/ocrText.ts` | ML Kit OCR for scanned PDFs |
| F4 | Create `parsing/pdf/pdfToChapters.ts` — converts `pageTexts: string[]` + PDF metadata into `ParsedChapter[]` where each chapter = one PDF page. Sets `id = 'page-${n}'`, `title = 'Page ${n}'`, `rawText = pageTexts[n]`, `level = 0`, `href = ''`, `html = ''`. Output matches `ParsedChapter` type from `parsing/epub/parse.ts:3` so downstream systems consume it unchanged | New: `app/src/parsing/pdf/pdfToChapters.ts` | Output format: `ParsedChapter[]` |
| F5 | Update `parsing/pdf/extractMetadata.ts` — replace stub `hasTextLayer: pageCount > 0` with real detection: call `extractText(pdfUri)` on first page, check if extracted text length > 200 chars. Set `hasTextLayer` accordingly. Store `totalTextLength` for the existing `ReaderScreen` heuristic | Modify: `app/src/parsing/pdf/extractMetadata.ts` | `phase-1.md:3.3` — scanned PDF detection |
| F6 | Update `ReaderScreen.tsx` PDF path — before rendering `<PdfView>`, call `extractText(pdfUri)` → if `hasTextLayer`, build `parsedChapters` via `pdfToChapters()`. If not, queue `ocrText()` on visible pages (background, with loading state). Feed `parsedChapters` into existing `ScrollMode`/`PaginateMode`/`useTts` pipeline — same code path EPUBs use | Modify: `app/src/features/reader/screens/ReaderScreen.tsx` | PDF text flows into existing pipeline |
| F7 | Update `PdfView.tsx` — add `onText` callback to `<Pdf>` component if supported by `react-native-pdf@6.7.x` for embedded-text PDFs (alternative to pdfjs-dist). Keep `<Pdf>` as the visual renderer — extracted text is a parallel data layer, not a display replacement. If `onText` unavailable or unreliable, fall back to `pdfjs-dist` (F2) | Modify: `app/src/parsing/pdf/PdfView.tsx` | `react-native-pdf` text extraction |
| F8 | Add `ParsedChapter[]` state for PDFs in `ReaderScreen.tsx` — new `pdfChapters` state variable, set after extraction completes. Pass to `useTts(pdfChapters)` and to `ScrollMode`/`PaginateMode` as `chapters` prop. For PDFs, `parsedChapters` now contains real page text instead of empty strings — the `hasTextLayerForBook` heuristic (`totalRawLength > 200`) will now correctly evaluate to `true` for embedded-text PDFs | Modify: `app/src/features/reader/screens/ReaderScreen.tsx` | `phase-2.md:7` — parsing output for TTS/search |
| F9 | Wire `rawTextPerChapter` for PDFs into `SearchSheet` — currently `rawTextPerChapter = parsedChapters.map(c => c.rawText)` (line 111). With real extracted text, PDF search becomes functional. No code change needed if F6/F8 correctly populate `parsedChapters` — the existing `rawTextPerChapter` derivation handles it | Verify only (no change if F6/F8 correct) | Search works on PDFs automatically |
| F10 | Update `TtsQueue.buildQueue()` to handle PDF chapter structure — PDF "chapters" are pages, so sentence splitting per page is correct but page boundaries may split mid-sentence. Add optional `mergeAcrossPages` flag: when true, concatenate adjacent page texts before sentence splitting to avoid mid-sentence breaks. Default off for EPUBs, on for PDFs | Modify: `app/src/tts/TtsQueue.ts` | TTS sentence continuity across PDF pages |
| F11 | Add OCR progress UI — when `hasTextLayer === false` and OCR is running, show a progress indicator in `ReaderScreen` (e.g., "Recognizing text... Page 3/12"). Use `ActivityIndicator` + progress text. Dismiss when OCR completes. Store OCR results in `FileStorage` cache (`{bookId}_ocr.json`) so OCR runs only once per PDF | New/modify: `app/src/features/reader/screens/ReaderScreen.tsx`, `app/src/data/files/FileStorage.ts` | UX — OCR feedback |
| F12 | Add ProGuard keep rules for `pdfjs-dist` WASM and ML Kit in `proguard-rules.pro` — ensure WASM binary and ML Kit native classes are not stripped by R8 | Modify: `android/app/proguard-rules.pro` | B4 (R8 enablement) must not break PDF/OCR |

**Depends On:** M1–M7 (all features live). M8 (this extension completes what M8 intended). F1–F5 (extraction pipeline) must complete before F6–F10 (wiring). F12 depends on B4 (R8).

**Plugs Into:**

- **A1–A12 (A11y):** Every labelled component is already mounted via `RootNavigator` → `ReaderScreen` → panels. Adding `accessibilityLabel`/`accessibilityRole` does not change rendering — it only adds metadata that TalkBack reads. Reduced-motion (A9) plugs into `AccessibilityInfo` which is a React Native built-in — no new dependency. TTS+TalkBack (A10) plugs into existing `TtsEngine` lifecycle.
- **B1–B5 (Perf):** FastImage cache (B1) affects only `BookCard`/`BookDetails`/`ContinueReadingCard` — all already rendered in Library. PagesGrid tuning (B2) is a prop change on an existing FlatList. R8 (B4) and signing (B5) are build-time only — no runtime behavior change.
- **C1–C6 (Settings + Dark Mode):** `SettingsScreen` is pushed from `LibraryScreen` gear icon → route added to `RootNavigator` in same commit (per Section 1 rule 3 — no orphan screens). `AppThemeToggle` calls `setAppTheme()` which already exists in `ThemeProvider` context — the toggle is the first consumer, closing the loop. `appTheme` persistence writes to `settings` table (already open since M1). About/Privacy/Terms are static screens or links — no new repositories.
- **D1–D2 (Branding):** Icon replacement is asset-only — no code change. Splash screen hooks into `MainActivity.tsx` which already exists — the splash is shown before React loads and dismissed by `SplashScreen.hide()` after `App.tsx` mounts.
- **E1–E4 (CI/Release):** `assembleRelease` in CI validates the same build artifact that ships. ESLint tightening catches issues before merge. Version-bump script is a dev tool — no runtime effect.
- **F1–F5 (Extraction pipeline):** Produces `ParsedChapter[]` — the exact type consumed by `ScrollMode`, `PaginateMode`, `TtsQueue.buildQueue()`, `SearchSheet`, and highlight matching (`rawText.indexOf()`). No downstream system needs modification if the output format matches.
- **F6–F8 (ReaderScreen wiring):** The PDF code path in `ReaderScreen.tsx` already has `parsedChapters` state — it's currently populated from EPUB parsing or empty for PDFs. The change: populate it from `extractText()` → `pdfToChapters()`. The `useTts`, `ScrollMode`, `PaginateMode`, and `SearchSheet` calls already consume `parsedChapters` — they receive real text for PDFs without knowing the source.
- **F9 (Search):** `rawTextPerChapter` is derived as `parsedChapters.map(c => c.rawText)` at `ReaderScreen.tsx:111`. If `parsedChapters` contains real PDF page text, search works automatically — no additional wiring.
- **F10 (TTS sentence merging):** `TtsQueue.buildQueue()` at `TtsQueue.ts:24` already iterates `chapters` and splits each `ch.rawText` into sentences. The merge flag concatenates adjacent page texts before splitting — a local change inside `buildQueue()`, transparent to callers.
- **F11 (OCR progress):** Plugs into existing loading state in `ReaderScreen` — no new screen, no new route. Cache in `FileStorage` means OCR runs once and subsequent opens skip extraction.
- **F12 (ProGuard):** Ensures B4 (R8 enablement) doesn't break WASM loading or ML Kit native calls. Must be applied in the same milestone as B4.

**Dead Code:** None. Every new file is imported by `ReaderScreen.tsx` (reachable via `RootNavigator`). `extractText.ts` and `ocrText.ts` are consumed by `ReaderScreen` — not left as unused utilities. The OCR cache in `FileStorage` is read on subsequent opens — not a dead write.

**Verification (run after M8-Extension):**

- **A11y:** Enable TalkBack → navigate Library → Details → Reader → menu → toolbar → panels → every element announces its label and role. Long-press text → selection toolbar buttons all announce. Note sheet announces "Add Note" with anchor text. Toggle system Reduce Motion → page transitions become instant, menu snaps instead of sliding.
- **Perf:** Release APK size is smaller than debug APK (R8 working). PagesGrid with 1000+ pages scrolls at 60 FPS. `FastImage` covers load from cache on second visit.
- **Dark Mode:** Settings → toggle Warm Dark → app chrome (Library background, cards, toolbar, menu) switches to `#1E1814` palette. Close app → reopen → warm dark persists. Reading theme stays per-book (sepia unaffected).
- **Settings:** Settings screen opens from Library gear icon. Reading goal editable. Privacy Policy / Terms links resolve (or static text displays correctly). Content Notice shows `phase-1.md:5.2` text.
- **Branding:** App icon is custom Reeda logo (not default RN blue). Splash shows logo on cold start and dismisses within 2s.
- **Release:** `ci.yml` shows green `assembleRelease` job. `release.yml` produces APK signed with release key (verify with `apksigner verify`). ESLint runs clean with tightened rules.
- **PDF embedded text:** Open a digital EPUB→PDF (e.g., from Calibre) → TTS starts reading from current page → sentence sync works → highlights appear on long-press → search finds text across pages. `hasTextLayer` evaluates to `true`.
- **PDF scanned:** Open a scanned document → OCR progress indicator appears → after recognition, TTS reads recognized text → highlights work → search works. `hasTextLayer` evaluates to `false` initially, then extraction populates `parsedChapters`.
- **PDF cache:** Close and reopen same scanned PDF → OCR does not re-run (reads from cache). Verify `FileStorage` has `{bookId}_ocr.json`.
- **PDF sentence continuity:** TTS across page boundary → no mid-sentence breaks (F10 merge flag working).
- **PDF + R8:** Release APK with R8 enabled → PDF with embedded text still extracts text (WASM not stripped). ML Kit OCR still functions (native classes not stripped).
- **No regression:** EPUB reading, TTS, highlights, search still work identically — the PDF changes are additive, not modifying existing EPUB code paths.

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
| J14 | Settings → toggle dark mode → app chrome switches → reopen → persists; Settings → About → Privacy/Terms resolve; TalkBack covers all panels; release APK signed + R8 minified | M8-Ext | ThemeProvider setAppTheme → settings persistence; a11y labels; CI release gate |
| J15 | Open PDF with embedded text → TTS reads pages → highlights work → search finds text; Open scanned PDF → OCR progress → TTS reads recognized text → highlights work; Reopen same PDF → OCR cached, instant load | M8-Ext (F) | extractText/pdfToChapters → ParsedChapter[] → TTS/highlights/search pipeline |

---

## 5. Master Integration Map — Every Script Knows Its Two Neighbors

Every script must have at least one **provider** (what it consumes) and one **consumer** (what consumes it). If either column is empty, it is dead code and must be explained in Section 6.

| Script / Module | Provides To Consumer | Consumes From Provider | Consumer(s) | Verified By Journey |
|-----------------|----------------------|------------------------|-------------|---------------------|
| `tokens.ts` + `ThemeProvider` (M1) | Colors/spacing/typography + app-chrome vs reading-content scopes | — (source of truth) | Every `shared/ui/*`, `LibraryScreen`, `BookCard`, `ReaderScreen`, `RectangularMenu`, `ReadingToolbar`, `ProgressStrip` | Visual: any screen change via `useTheme()` |
| `DatabaseProvider` + `001_initial` (M1) | SQLite handle + 11 tables | — | Every `*Repository` | `sqlite_master` check (M1) |
| `shared/ui/*` — Card, Button, Sheet, Slider, Toggle, SegmentedControl, Pill (M1) | Reusable chrome used everywhere | `tokens.ts` + `icons` | Every feature screen/panel | No screen builds its own button — grep proves import from `shared/ui` |
| `shared/icons` (M1) | Lucide re-exports | `lucide-react-native` | Every feature | Swap test: change one icon in `shared/icons` → all usages update |
| `RootNavigator` + providers wrapper (M1) | Reachability for every screen | `ThemeProvider` + `DatabaseProvider` | `Library`, `BookDetails`, `Reader` (+ all future routes) | J1–J14 all start with navigation |
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
| `SettingsScreen` + `AppThemeToggle` + `AboutSection` (M8-Ext) | App settings: dark mode toggle, reading goal, privacy/terms/about | `ThemeProvider.setAppTheme` + `SettingsRepository` + `tokens.ts` palettes | `LibraryScreen` (gear icon), `RootNavigator` route | J14 |
| `PrivacyScreen` / `TermsScreen` (M8-Ext) | Legal content display | `phase-1.md:5.3/5.4` text | `SettingsScreen` → About section | J14 |
| `useTalkBackDetection` hook (M8-Ext) | TalkBack active state for TTS ducking | `AccessibilityInfo` (RN built-in) | `TTSMiniPlayer`, `TtsEngine` | J14: TTS+TalkBack don't conflict |
| All `shared/ui/*` a11y labels (M8-Ext) | `accessibilityLabel` + `accessibilityRole` on Button, Card, Pill, Toggle, Slider, SegmentedControl | `tokens.ts` (unchanged) | Every consumer — Library, Reader, Settings, Import | J14: TalkBack covers all UI |
| All reader panels a11y labels (M8-Ext) | `accessibilityLabel` + `accessibilityRole="header"` on 12 panel headers | Existing panel components | `RectangularMenu` → panels | J14: TalkBack announces panel titles |
| `build.gradle` release signing + R8 (M8-Ext) | Release APK signed with release key + minified | `gradle.properties` secrets | `release.yml`, `ci.yml` assembleRelease | J14: release APK verified |
| Custom mipmap icons + splash (M8-Ext) | Branded app icon and launch screen | `assets/logo.svg` / `assets/logo.png` | Android launcher, `MainActivity.tsx` | J14: custom icon + branded splash |
| `extractText.ts` — pdfjs-dist text extraction (M8-Ext F) | Page-level text from embedded-text PDFs → `{ pageTexts: string[], hasTextLayer: boolean }` | `pdfjs-dist` (PDF.js) | `ReaderScreen` (PDF path), `extractMetadata.ts` (detection) | J15: PDF TTS + highlights |
| `ocrText.ts` — ML Kit OCR (M8-Ext F) | Page-level text from scanned/image-only PDFs → `{ pageTexts: string[] }` | `@react-native-ml-kit/text-recognition` | `ReaderScreen` (PDF fallback), `FileStorage` (OCR cache) | J15: scanned PDF TTS |
| `pdfToChapters.ts` — PDF → ParsedChapter[] (M8-Ext F) | Converts page texts into `ParsedChapter[]` format matching EPUB output | `extractText.ts` or `ocrText.ts` | `ReaderScreen` → `ScrollMode`/`PaginateMode`/`useTts`/`SearchSheet` | J15: unified PDF + EPUB pipeline |
| `FileStorage` OCR cache (M8-Ext F) | `{bookId}_ocr.json` — cached OCR results per PDF | OCR output from `ocrText.ts` | `ReaderScreen` (skip re-OCR on reopen) | J15: instant reopen |
| `TtsQueue` mergeAcrossPages (M8-Ext F) | Concatenates adjacent PDF page texts before sentence splitting to avoid mid-sentence breaks | `ParsedChapter[]` with PDF chapter IDs | `useTts` → TTS engine | J15: sentence continuity |

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
| 2026-09-12 | M8-Extension milestone added to close a11y, perf, dark chrome, settings, branding, and release gaps found during pre-release audit | M8 covered the intent; M8-Ext provides the granular task breakdown so nothing is missed before Play review |

---

## 9. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | Complete |
| `docs/phase-2.md` | Technical Architecture | Complete |
| `docs/phase-3.md` | Design Spec — Home/Library | Complete |
| `docs/phase-3-reader.md` | Design Spec — Reader + Menu | Complete |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | **Complete (this doc — updated with M8-Ext)** |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | Complete |

---

## 10. How to Use This Document

- **Developers / AI Agents:** Do not pick a file to build by looking at `phase-2.md` structure alone — look at **Section 3** milestones in order. Each task is "build this file *because* it plugs into that existing consumer and is verified by that journey." If you cannot name its consumer, it is dead code — do not build it yet or add it to Section 6.
- **Designers:** Journeys J1–J12 in Section 4 are your acceptance tests — if a journey cannot be completed, the feature is not done even if the component matches the Figma.
- **Reviewers:** Check **Section 5** row by row — every script must have both a provider and a consumer. Check **Section 6** is empty or every row has an expiry milestone and a disabled hint. Merge only if J1–J12 for that milestone pass.
