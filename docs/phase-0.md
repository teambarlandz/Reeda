# Phase 0 — Product Definition

> **Purpose:** Establish what this app is, who it serves, why it matters, and where the boundaries are before any design or code begins.
> **Audience:** Any developer, designer, or AI agent picking up this project for the first time.
> **Last Updated:** 2026-09-11

---

## 1. Project Overview

### App Type
Digital book reading application for Android.

### Tech Stack
- **Frontend:** React Native (Android only — for now)
- **No Rust/Native engine for now.** All logic in React Native. Rust is off the table unless there is a proven, specific performance bottleneck that cannot be solved in JS.

### Reference Design
The app UI is inspired by modern book-reading apps (Apple Books, Google Play Books, Kindle) — clean, card-based library views, an immersive reader experience, and rich annotation tools. The original design image is located in the project root: `603d5406845a0ef07254c5da1dbf5b1f.jpg`.

---

## 2. Problem Statement

Existing book-reading apps are often generic, ad-heavy, or tailored to a narrow audience. There is no single Android reading app that serves the full spectrum from a student annotating textbooks, to a religious reader studying scripture, to a power reader managing a massive personal library — all in one cohesive, beautiful, distraction-free experience.

---

## 3. Vision Statement

> A premium, feature-complete Android reading app that feels like it was built for people who genuinely love to read — combining deep library management, a powerful and customizable reading engine, and smart tools that make any type of reading more productive and enjoyable.

---

## 4. Target Audiences

### 4.1 Students
- **Needs:** Highlight and annotate textbooks, organize by subject/shelf, search within books, track reading progress across multiple courses, carry a heavy library without physical weight.
- **Pain points:** Switching between apps for notes, losing track of where they read, cluttered interfaces during study sessions.
- **Key features for this group:** Highlights, notes, search-in-book, shelf/category organization, TTS for auditory study.

### 4.2 Religious Readers
- **Needs:** Scripture reading with bookmarks and notes, daily reading plans/goals, verse highlighting, comfortable reading modes for long sessions (sepia/dark themes, adjustable fonts), scripture-specific organization (by book, chapter, verse).
- **Pain points:** Apps not optimized for scripture-style content (chapter/verse structure), lack of daily devotion tracking, uncomfortable bright screens for evening reading.
- **Key features for this group:** Custom reading goals (daily reading streaks), bookmark folders, dark/sepia modes, TTS for read-aloud scripture, chapter navigation.

### 4.3 Casual Readers
- **Needs:** Simple, beautiful library view, easy book discovery, one-tap open and read, no complex setup, track what they've read.
- **Pain points:** Overwhelming feature-rich apps, confusing navigation, slow load times, apps that feel like work.
- **Key features for this group:** Clean home screen, recently added/recommended section, effortless reading mode, progress tracking.

### 4.4 Power Readers
- **Needs:** Massive library management (1000+ books), advanced sorting/filtering, statistics and analytics, highlights/notes review across all books, export tools, offline reading, custom font/theme control.
- **Pain points:** Apps that break down with large libraries, no way to analyze their reading habits, no way to export or share their notes.
- **Key features for this group:** Sort/filter, reading stats, export highlights/notes, offline downloads, custom shelves/tags, search across library.

---

## 5. Unique Value Proposition

This app is built around one principle: **every type of reader should feel like the app was designed specifically for them.** Unlike competitors that optimize for one persona, this app serves students, religious readers, casual readers, and power readers through:
- Deeply customizable reading experience (fonts, themes, gestures, layout)
- Rich annotation tools (highlights, notes, bookmarks, dictionary)
- Smart reading goals and personal stats
- A clean, premium interface that stays out of the way

---

## 6. Goals and Success Metrics

### Primary Goals
1. Deliver a polished, immersive reading experience that rivals established apps.
2. Build a library management system that scales from 10 to 10,000 books.
3. Support all major reading interaction types (read, highlight, annotate, bookmark, TTS, search).
4. Make the app accessible and comfortable for extended reading sessions.

### Success Metrics (KPIs)
| Metric | Target (Post-Launch) |
|--------|---------------------|
| Crash rate | < 0.5% of sessions |
| Cold start time | < 2 seconds |
| DAU / MAU ratio | > 20% |
| Average reading session length | > 15 minutes |
| Reader screen retention | > 70% return within 7 days |
| Library scroll FPS | 60 FPS with 1000+ books |

---

## 7. Scope Definition

### In Scope — MVP
- Library screen (grid/list views, book cards with progress)
- Book data model (title, author, cover, genre, status, progress)
- Reader screen (scroll/paginate modes, TOC, font/theme customization, chapter navigation)
- Highlighting (multi-color)
- Bookmarks (page-level, with folder organization)
- Notes/annotations (attached to highlights or pages)
- Book details page (metadata, actions)
- Book status management (Currently Reading, Want to Read, Read, On Hold)
- Search library
- Sort and filter library
- Reading goals and basic stats (time read, books completed, streaks)
- Custom shelves/tags/collections
- Theme modes: Light, Dark, Sepia
- Basic gestures (tap to toggle UI, swipe to navigate pages)
- Import books locally (EPUB, PDF)

> **Addendum — Library Search Scope — Added 2026-09-11:** `Search library` above now specced in `docs/phase-3.md:3.9` + `docs/phase-2.md:5.1.1` as offline, local-only full-text search over `title + author + genre + shelf/tag + fileName` via `books_fts` (`bm25` ranking, `prefix 2 3 4`, `unicode61 remove_diacritics`). Facets `All|Title|Author|Genre|Shelf` and recents (`10` capped) are part of MVP. Distinct from in-book search (`phase-3-reader.md:Item 6`). No change to `Out of Scope` — store/catalog search remains out.

### Out of Scope — MVP
- Cloud sync / multi-device
- User authentication (local-only for now)
- TTS / Read Aloud (Phase 2)
- In-app book store / purchasing
- Audiobook support
- Social features (sharing, book clubs)
- Analytics dashboard beyond basic stats
- Web/iOS versions

### Out of Scope — Entire Project (Unless Explicitly Re-Featured)
- Rust/Native engine integration (deferred indefinitely unless proven critical)
- DRM / publisher partnerships
- Content store (no book purchasing within the app)

---

## 8. Constraints

| Constraint | Detail |
|------------|--------|
| Platform | Android only (min API level TBD — recommend 24+ / Android 7.0) |
| Language | React Native (JavaScript/TypeScript) — no Rust, no Kotlin/JNI bridge |
| Design source | Reference image `603d5406845a0ef07254c5da1dbf5b1f.jpg` in project root |
| Book content | User-imported or locally stored — no cloud content store in MVP |
| Target devices | Phones primarily; tablets and foldables as secondary concern |

---

## 9. Open Questions (Require Decision Before Design)

| # | Question | Decision Needed By |
|---|----------|--------------------|
| 1 | What is the app name? | **Decided — Reeda** |
| 2 | What is the min Android API level? | Architecture phase |
| 3 | TypeScript or JavaScript for React Native? | Development setup |
| 4 | Will books be EPUB-only for MVP, or also PDF? | MVP scope lock |
| 5 | Monetization model: free, paid, or subscription? | Before store listing |
| 6 | Is the user a solo developer, or is there a team? | Timeline planning |
| 7 | Where is the reference design stored (Figma, sketch, image)? | Design phase |

---

## 10. Decision Log

*Record all key decisions here with date and rationale. This prevents revisiting settled questions.*

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-11 | React Native only, no Rust | RN sufficient for book app performance; Rust adds unnecessary complexity at this stage |
| 2026-09-11 | Android-first, no iOS | Focus resources on one platform; expand after market validation |
| 2026-09-11 | MVP scope locked to Phase 0 definition | Prevent scope creep; validate core value before expanding |

---

## 11. How to Use This Document

- **New developers:** Read this document first. It defines what the app is and who it is for.
- **AI agents:** Use this as the product brief. When generating code, designs, or plans, align all output with the audiences, scope, and constraints defined here.
- **Updates:** Any change to scope, audience, or vision should be recorded in the Decision Log with a date and rationale.
- **Next step:** See `phase-1.md` (Legal & Content) → `phase-2.md` (Technical Architecture) → `phase-3.md` + `phase-3-reader.md` (Design).
