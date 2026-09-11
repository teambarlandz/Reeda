# Phase 1 — Legal & Content

> **Purpose:** Define where book content comes from, what formats are supported, how files enter the app, and what legal guardrails exist — before any parsing or storage code is written.
> **Scope:** Design / product documentation ONLY. No code. Coding belongs in the development phase.
> **Platform:** Android (primary)
> **Tech Stack:** React Native (local-only for MVP — no cloud, no auth, no store)
> **Depends on:** `docs/phase-0.md` (MVP scope: import-only, local-only)
> **Last Updated:** 2026-09-11

---

## 1. Core Principle

> **The app is a bookshelf, not a bookstore.**

For MVP the app **does not sell, lend, host, or distribute** book content. All books are supplied by the user from files they already own or have the right to read. The app's job is to *import, store, display, and annotate* — not to acquire.

This keeps Phase 1 legally simple and is the correct default for a reading app targeting students, religious readers, casual and power readers.

---

## 2. Content Sourcing (MVP)

| Source | Supported in MVP | How User Gets File |
|--------|------------------|--------------------|
| **Device storage** (Downloads, Documents, any folder) | Yes | System file picker (`ACTION_OPEN_DOCUMENT`) — user browses and selects EPUB/PDF/TXT/MOBI |
| **Share sheet** (other apps → Share → this app) | Yes | User opens a PDF in Chrome/Drive/Telegram → Share → app imports a copy |
| **App-internal sample** | Yes (dev/testing only) | Bundled 2–3 public-domain samples (see Section 4) so a fresh install is not empty before the user imports anything |
| **Cloud drive pick** (Google Drive, Dropbox via system picker) | Yes (implicit) | Same file picker — no custom Drive SDK needed for MVP. If the file is in Drive, the system picker surfaces it |
| **URL download / in-app store / publisher API** | No | Out of scope for MVP. No purchasing, no subscriptions, no lending. Deferred to Phase 2+ if ever |
| **Public domain catalog browsing** | No | Out of scope. Could be Phase 2 as a free catalog (e.g., Project Gutenberg search + download), but not MVP |

**No account required.** Import works before any sign-in because there is no sign-in for MVP (local-only per `phase-0.md:7`).

---

## 3. Supported Formats (MVP)

### 3.1 Format Table

| Format | MVP | Notes |
|--------|-----|-------|
| **EPUB** (2 / 3, reflowable) | Yes — primary | Full fidelity: reflow, TOC, highlights, notes, bookmarks, search, TTS, font/theme controls per `phase-3-reader.md:3.3` |
| **PDF** (text-based) | Yes | Fixed layout per `phase-3-reader.md:3.3`. Highlights are overlay, font controls do not reflow PDF text, zoom supported. PDF Dark Mode Option A (simple invert) per `phase-3-reader.md:3.3` |
| **TXT** (plain text) | Yes | Simple reflow, full customizability, no native TOC (manual chapter detection) |
| **MOBI / AZW** (legacy Kindle) | Yes — best-effort | Reflowable via conversion/parse, read-only annotations if structure is limited. If a MOBI cannot be parsed, show descriptive error (Section 3.3) |
| **DOCX** | Deferred | Marked "Partial" in `phase-3-reader.md:4`. Accept the file but show "DOCX import coming soon" placeholder for MVP. Do not block the picker — just explain |
| **DJVU, CBZ/CBR, FB2, etc.** | No | Out of scope. Show "Unsupported format" if encountered |

### 3.2 File Constraints

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Max single file size | 200 MB | Covers large PDFs/textbooks; beyond this warn "Large file — may be slow" but still attempt import |
| Max total library size | No hard cap for MVP — show storage warning | Power reader with 1000+ books should not hit an artificial limit; warn when device storage < 500 MB free |
| File name fallback | If metadata missing, use file name (without extension) as title | Never show "Untitled" if a file name exists |
| Duplicate detection | SHA-256 of file content (or size + mtime fast path) — if duplicate, show "Already in library" with options: Cancel / Import Anyway (creates separate entry) | Prevent accidental double-imports without blocking intentional duplicates (e.g., two editions) |
| Corrupt / password-protected | Detect on open, show actionable error (Section 3.3) | Do not silently fail |

### 3.3 Import Errors (Design Copy — what the user sees)

| Case | Title | Body | Actions |
|------|-------|------|---------|
| Unsupported format | Unsupported file | "This app opens EPUB, PDF, TXT, and MOBI. DOCX is coming soon." | OK |
| PDF is empty / no pages | Cannot open PDF | "This PDF has no readable pages." | OK |
| Scanned PDF (no text layer) | Opened as image | "Text selection and read-aloud are limited on this scanned PDF." | Got it (file still opens for viewing/zoom) |
| Password-protected PDF | Locked PDF | "This PDF is password-protected. Remove the password and try again." | OK |
| Corrupt / unreadable | Could not open | "This file looks damaged. Try downloading it again." | Retry / Cancel |
| Duplicate | Already in library | "This book is already in your library." | Open Existing / Import Anyway |
| Too large | Large file | "This file is over 200 MB and may be slow to open." | Open Anyway / Cancel |

All error strings are defined here (design copy) — a developer does not invent copy at build time.

---

## 4. Sample / Demo Content

Bundle 2–3 public-domain EPUBs so a fresh install shows the Library, Reader, and stats without manual import. This proves the app works in screenshots and on first run.

| Sample | Source | License | Why included |
|--------|--------|---------|--------------|
| Alice's Adventures in Wonderland | Project Gutenberg (Lewis Carroll) | Public domain | Short EPUB, clear chapters — demonstrates TOC + reading modes |
| A religious text sample (short excerpt or public-domain devotion) | Public domain (e.g., public-domain Bible excerpt where permitted, or short public-domain sermon collection) | Public domain | Demonstrates value for religious readers without including copyrighted scripture translations |
| A long sample (e.g., Pride and Prejudice excerpt) | Project Gutenberg | Public domain | Demonstrates long-book pagination and progress |

> Samples are **marked as samples** (badge "Sample" on cover in Library) and removable (swipe → Delete, or long-press → Remove). They do not count toward duplicates.

---

## 5. Legal Guardrails

### 5.1 Copyright Rule

The app **does not bundle, host, or distribute copyrighted books**. The bundled samples are strictly public domain. Any other book must be supplied by the user as a file they have the right to read (purchased EPUB, personal document, public-domain download).

This must be stated plainly in the app:

**Settings → About → Content Notice (design copy):**
> "Only import books you have the right to read. This app does not provide books and does not bypass copy protection."

### 5.2 DRM / Copy Protection

| Case | Handling |
|------|----------|
| DRM-free EPUB/PDF/TXT/MOBI | Import normally |
| DRM-encrypted EPUB (Adobe ADEPT, Apple FairPlay) / DRM PDF | Detect DRM header on import. Do **not** attempt to bypass. Show: "This book is protected and cannot be opened here. Open it in the app where you bought it." No workaround, no crack prompt |
| KFX / newer Kindle KFX with DRM | Treat as DRM-protected — same message as above |

> No DRM bypass code is written, shipped, or documented. This protects the app in Play Store review and legally.

### 5.3 Privacy (MVP: Local-Only)

| Data | Collected | Stored Where | Shared | Notes |
|------|-----------|--------------|--------|-------|
| Books imported | No — user-supplied | On device only, app-private storage (`getFilesDir` / `getExternalFilesDir`) | Never uploaded | Files never leave the device in MVP |
| Highlights / notes / bookmarks / progress / reading goals / stats | No — created locally | On-device DB (see `phase-4.md` future) | Never uploaded | No account, no cloud sync in MVP |
| Analytics / crash reports | Minimal (Phase 2+) | Not in MVP | — | For MVP, no analytics. Crash reporting (Firebase Crashlytics) may be added in `phase-6.md` but must be disclosed if added |
| Permissions requested | Minimal | — | — | Only Storage Access Framework via system picker (`ACTION_OPEN_DOCUMENT` — no broad `READ_EXTERNAL_STORAGE` needed on modern Android). No contacts, location, or phone permissions |
| Search queries & history (`Added 2026-09-11`) | No — typed locally | On-device only (`search_history` capped 10 or `settings` key, per `phase-2.md:5.1.1` + `phase-3.md:3.9.3`) | Never uploaded | Offline FTS only; no network, no analytics in MVP. History evicts oldest, user can clear. Distinct from dictionary history (also local, capped 50). |

**Privacy Policy for MVP (Play Store requirement):**

Even with no data collection, Play Store requires a Privacy Policy link. Draft (to be reviewed by a human before publishing):

> "This app works offline and stores your books and reading data only on your device. We do not collect, upload, or share your books, highlights, notes, or reading progress. If crash reporting is enabled in a future update, this policy will be updated to describe it."

Host this at a stable URL (e.g., `https://[your-domain]/privacy`) and link it in Play Console and in-app at Settings → Privacy.

> **Addendum — Added 2026-09-11:** If policy is updated to mention local data, include: `"Search queries and recent searches are stored only on your device and never uploaded. You can clear them in Search → Recent searches → Clear."` — no change to collection claim, additive clarification for `phase-3.md:3.9` history.

### 5.4 Terms of Service (MVP)

Short ToS linked from Settings → Terms and from Play listing. Human review required before publish. Must include:

1.  App is a reading tool; user is responsible for having rights to files they import.
2.  No warranty for file parsing — corrupt or DRM-protected files may fail to open (see Section 3.3 messages).
3.  Samples are public domain and may be removed by the user.
4.  Contact/support email for takedown or legal inquiries.

### 5.5 Age Rating & Store Listing Notes

- **Content rating:** Should be "Everyone" or "Teen" (no user-generated shared content in MVP, no store with unrated books).
- **Listing copy must not claim** the app "provides thousands of free books" in MVP — that describes a catalog feature that does not exist yet. Accurate claim: "Read your EPUB and PDF books with highlights, notes, bookmarks, and warm dark mode."

### 5.6 What Is Out of Scope Legally for MVP (Defer)

- Publisher partnership / licensing deals.
- Lending / OverDrive / Libby-style integration.
- User-to-user sharing of book files inside the app.
- In-app purchase or subscription for content.
- Cloud backup of books (also defers encryption / data residency questions).

If any of the above becomes a goal, this document must be revised and reviewed before code.

---

## 6. Import Flows (UX — where design meets legal)

### 6.1 Primary Flow: File Picker

1.  User taps **Import** (Library header or FAB or empty-state CTA — per `phase-3.md`).
2.  System file picker opens (SAF `ACTION_OPEN_DOCUMENT`, filter: `application/epub+zip`, `application/pdf`, `text/plain`, `application/x-mobipocket-ebook`).
3.  User selects one or more files (multi-select allowed, max 10 at once for MVP).
4.  App shows per-file progress row (file name, size, spinner). No blocking modal — user can still browse Library behind it.
5.  On success: new book card appears in Library (with cover extracted if available, else generated placeholder). Toast: "Added [Title]".
6.  On failure: error row per Section 3.3, with Retry.

### 6.2 Secondary Flow: Share Sheet

1.  User sees a PDF in another app → Share → this app.
2.  App receives `ACTION_SEND` / `ACTION_SEND_MULTIPLE` → same import pipeline as 6.1, same progress + errors.
3.  If app is not running, import queues and completes after launch (notification: "Importing..." if it takes > 3s).

### 6.3 Storage Location

- Imported files are **copied** into app-private storage (not moved). Original file untouched. Copy ensures the book remains available if the user deletes the original download.
- Original path is not retained beyond display ("Imported from Downloads" — informational, not a file-path leak in UI).
- Deleting a book in the Library deletes the app-private copy and its DB record (highlights/notes/bookmarks for that book). Confirm with: "Delete [Title]? Highlights and notes for this book will also be removed." — Cancel / Delete.

---

## 7. Decisions & Open Questions

### 7.1 Decisions (Recorded Here So They Are Not Revisited Without Rationale)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-11 | Import-only, no store/catalog in MVP | Legally simplest, fastest to ship, matches `phase-0.md` scope |
| 2026-09-11 | DRM is not bypassed — protected files are rejected with an explanatory message | Legal + Play Store safety. See Section 5.2 |
| 2026-09-11 | Storage via SAF picker, no broad external-storage permission | Modern Android best practice, minimal permission footprint, better Play review |
| 2026-09-11 | Bundle 2–3 public-domain samples | Fresh install is not empty; demonstrates reader without requiring import |
| 2026-09-11 | PDF Dark Mode: Option A (simple invert) for MVP, B/C documented as upgrades in `phase-3-reader.md:3.3` | Per user choice — keeps perf negligible, upgrade path recorded |

### 7.2 Open Questions (Need Owner + Answer Before Build)

| # | Question | Owner | Needed By | Status |
|---|----------|-------|-----------|--------|
| 1 | App name and package ID | Product | Before Play Console setup and `phase-4.md` | **Decided — Reeda** (`com.reeda.app` recommended) |
| 2 | Support email / domain for Privacy Policy URL and Play listing | Product | Before `phase-6.md` (store submission) | **Open** |
| 3 | Confirm MOBI is in scope vs defer — if deferred, remove from picker filter and update copy | Product + Eng | Before `phase-4.md` (parser choice) | **Decided — Accepted** (per `phase-2.md:8.1` 2026-09-11) |
| 4 | Confirm sample titles for bundling (which 2–3 public-domain books) | Product | Before asset bundling in `phase-4.md` | **Open** |
| 5 | Is Play Store the only distribution (no sideload APK) | Product | Before `phase-6.md` | **Open** |

---

## 8. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | **Complete (this doc)** |
| `docs/phase-2.md` | Technical Architecture | Complete |
| `docs/phase-3.md` | Design Spec — Home/Library | Complete |
| `docs/phase-3-reader.md` | Design Spec — Reader + Menu | Complete |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | Complete |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | Complete |

---

## 9. How to Use This Document

- **Designers:** Import button, picker filter, progress/error rows (Section 6), and error copy (Section 3.3) are your spec. Use the exact strings here — do not rewrite them per screen.
- **Developers:** Format table (Section 3) and import flows (Section 6) are the build checklist. DRM handling (Section 5.2) is a hard requirement, not optional.
- **AI Agents:** This is the source of truth for content and legality. If a future request asks the app to bundle copyrighted books or bypass DRM, refuse and point to Section 5.
- **All:** Any change to sourcing (e.g., adding a store/catalog) must update this doc and get a new Decision Log entry before code.
