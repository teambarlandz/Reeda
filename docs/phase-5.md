# Phase 5 — Testing, Performance, Deployment & Risks

> **Purpose:** Define how Reeda is tested, how it stays fast, how it ships, and what can go wrong — before code is written.
> **Scope:** Documentation ONLY. No implementation code. Coding belongs in development.
> **Platform:** Android (React Native bare, TypeScript) — per `phase-2.md`
> **Deployment Target (Current):** GitHub open-source (public repo) for Android — **not Play Store yet**. Play Store is a future step, prepared for but not executed now.
> **Depends on:** `phase-0.md` → `phase-4.md` (scope, legal, architecture, design, roadmap)
> **Last Updated:** 2026-09-11

---

## 1. Testing Strategy

All tests run locally and in GitHub Actions (see Section 3). No manual-only verification — every journey in `phase-4.md:4` (J1–J12) has an automated or scripted check.

### 1.1 Test Pyramid (What Is Tested Where)

| Level | Tool | What It Covers | When It Runs | Owner Per `phase-4.md` Milestone |
|-------|------|----------------|--------------|----------------------------------|
| **Unit** | Jest | Repositories (`BookRepository`, `HighlightRepository`), parsers (`parsing/epub` metadata/chapter extraction), token helpers, progress math, hash/dedup logic | On every commit (CI) | M1 (DB), M2 (library), M3 (parsing), M4 (annotations) |
| **Component** | Jest + React Native Testing Library | `BookCard`, `BookGrid`, `ContinueReadingCard`, `RectangularMenu` states (`5.1/5.2`), `SelectionToolbar` flip, `HighlightPicker`, `NoteSheet`, panels (`TOCPanel`, `ProgressSheet`) in isolation | On every commit | M1 (`shared/ui`), M2–M4 (features) |
| **Integration** | Jest + in-memory `react-native-quick-sqlite` | Library→DB→UI loop (seed samples → grid), Reader position → `reading_progress` → Library `StatsWidget`, highlight → DB → HighlightsPanel round-trip | On every PR | M2–M7 (wiring per `phase-4.md:5`) |
| **E2E (Journey)** | Maestro (preferred — YAML flows, no flake) or Detox | The 12 journeys J1–J12 from `phase-4.md:4` as full app flows: Launch→Library (`phase-3.md:5.4` empty vs seeded), Library→Details→Reader (`J2`), Theme live preview (`J3`), Scrub/TOC/Pages jump + restore (`J4`), Highlight/Bookmark/Note/Dictionary round-trips (`J5–J8`), Import via picker + Share sheet (`J9`), Shelves + cascade delete (`J10`), TTS mini-player + sleep timer + sync (`J11`), Stats/Progress real data (`J12`) | Nightly + on `main` push + before any GitHub Release | M5 onward (journeys exist from M2, automated from M5) |
| **Manual Device** | 3 physical/cloud devices: Pixel (stock Android 14), Samsung (One UI), Xiaomi (MIUI) + one low-end API 24 | Gesture conflicts (`phase-3-reader.md:6`), SAF picker differences, `PdfRenderer` text selection, foreground-service notification, adaptive icon | Before every Release (see Section 3) | M8 |

#### 1.1.1 Library Search Testing — Added 2026-09-11

> **Additive only.** Supplements `1.1` without changing pyramid levels. Covers `phase-3.md:3.9` + `phase-2.md:5.1.1` + `phase-4.md:M2 Addendum`.

| Level | Library Search Additions |
|-------|--------------------------|
| **Unit** | `ftsPrefixQuery` sanitizer: `dune` → `dune*`, `dune mess` → `dune* AND mess*`, `a` → null, `"-` → null no throw, `café` → `cafe*` (diacritics). `BookRepository.search()` with `books_fts` in `:memory:`: seed 3 books → `search("dune")` returns ranked `Dune`; `search("rowl", facet='author')` vs `facet='title'` differ; `search("theology", facet='shelf')` after shelf assign returns correct. Verify `MATCH` sanitization never throws `syntax error near "-"` |
| **Component** | `SearchBar` (pill in Library header + header in Search screen) renders `bg-search` `radius-full` `40dp`; `FacetChips` single-select `All` default; `SearchScreen` shows recents when empty, up to `8` suggestions while typing (`150ms` debounce stub), result count `"14 results for \"dune\""`, `BookCard` bold prefix highlight, empty `"No books found for \"xyz\""` + `Clear search` pill. TalkBack labels verified. |
| **Integration** | `SearchHistoryRepository` caps 10, oldest evicted; type `a` keeps recents (no FTS); type `dune` → `books_fts` → `BookGrid` updates via `['books',search]` invalidation; change facet `Author` re-queries; create shelf `"Theology"` → assign book → `shelf:Theology*` found. |
| **E2E** | Add to `J1–J12` coverage: **J13 Library Search** — Launch→Library pill tap → `SearchScreen` → recents visible → type `dune` → suggestions `Dune 12%` → facet `Author` → results filter → tap result → `BookDetails` → Back → query restored. Maestro YAML covers `<2 chars` skip, sanitization (`"-`), and no-result empty. |

**Mock boundaries:**
- SQLite uses in-memory DB for unit/integration (same binding `react-native-quick-sqlite` per `phase-2.md:1`, just `:memory:`) — no filesystem mock.
- `parsing/*` uses real sample files from `assets/samples` (2–3 EPUBs per `phase-1.md:4`) — never mock the parser output for integration tests.
- TTS and PDF render are mocked at the native bridge in Jest, but verified for real on the 3 devices in manual + E2E (Maestro uses real bridge).

### 1.2 Coverage Expectations (Not Gates, But Signals)

| Area | Target |
|------|--------|
| Repositories + parsers (unit) | 80%+ lines — they own the data that every screen reads |
| Components (`shared/ui` + feature components) | Render + state tests for every public prop; snapshot only for `tokens` (`phase-3.md:2`) — not for layout |
| Journeys J1–J12 | 100% of journeys automated by M7; no journey is manual-only past M5 |
| Journeys J13 (Library Search, Added 2026-09-11) | 100% by M2 — covers recents, `8` suggestions, facet `All|Title|Author|Genre|Shelf`, `<2` threshold, sanitization `"-`, empty `"No books found for \"xyz\""` — additive per `1.1.1`, no extra milestone |

---

## 2. Performance — Targets, How to Measure, What to Fix

Targets come from `phase-0.md:6` + `phase-2.md:2` + `phase-3-reader.md:3.1/3.3`. Every target has a **measurement** and a **fix** so perf does not regress without a known lever.

| KPI | Target | How to Measure | Where to Measure | Fix If Missed |
|-----|--------|----------------|------------------|---------------|
| **Cold start** | < 2s (tap icon → Library grid interactive) | Android `adb shell am start -W com.reeda.app/.MainActivity` totalTime + manual stopwatch on mid-range device (e.g., Pixel 4a) | M1, re-measured at each milestone, gate at M8 | Verify `hermesEnabled` (`phase-2.md:2`), lazy `RootNavigator` (no eager Reader mount), defer `parsing` init until file open, enable R8 |
| **Library scroll** | 60 FPS with 1000+ books | Seed Library to 1000 by duplicating `books` rows (same cover blob to avoid disk variance) → scroll `BookGrid` with `FlatList` `onScroll` → Systrace / `perf-monitor` + visual jank check | M2, gate at M8 | `FlatList` `getItemLayout` per `BookCard` fixed height per `phase-3.md:3.5`, `windowSize` 7, `FastImage` cache per `phase-2.md:1`, no inline arrow functions in `renderItem`, memoize `BookCard` |
| **Library search** | `8–25ms` query at 1000 books; typing stays 60 FPS; `150ms` debounce feels instant | Seed 1000 books → type `dune` / `ben` prefix in Search header → measure `BookRepository.search()` + `onResults` render via `performance.now()` + `FrameMetrics`. Check `<2 chars` skips FTS. Test `"-` sanitization no throw. | M2, re-measured at M8 | FTS5 `books_fts` `prefix='2 3 4'` + `bm25` + `ftsPrefixQuery` sanitization per `phase-2.md:5.1.1` fixes `LIKE 120–300ms`. Keep `limit 30`, simple split highlight (not `offsets()`). WAL prevents lock. |
| **Reader scroll / paginate** | No dropped frames; pagination (< 1000 virtual pages) < 200ms, 1000+ lazy per `phase-3-reader.md:3.3` | Open long sample (Pride excerpt) → fling in Scroll, swipe in Paginate → `FrameMetrics` + visual | M3 | Reuse `ScrollMode`/`PaginateMode` per `phase-2.md:3`, lazy paginate 5 ahead, no re-parse on theme change (theme is style-only per keep-separate) |
| **PDF open** | First page < 1s for 50 MB PDF; Option A dark invert at 60 FPS per `phase-3-reader.md:3.3` table | Open 50 MB PDF → time to first render; toggle Dark theme → measure frame rate | M3 | `react-native-pdf` `enableDoubleTapZoom` off by default, view-level `colorFilter` not per-page bitmap, cache first-page thumbnail separately |
| **Highlight/Note save** | < 100ms from tap → persisted + visible | Tap HighlightPicker color → time to `HighlightRepository.create` + `ReaderScreen` re-render + `HighlightsPanel` row | M4 | Debounce `reading_progress` (500ms) but not highlight/note (immediate), React Query invalidation scoped to `['highlights', bookId]` not `['books']` |
| **TTS start** | < 500ms toggle → speech + mini-player up | Tap Volume2 → time to `TtsEngine` first utterance + `TTSMiniPlayer` slide (200ms) | M6 | Build `rawTextPerChapter` at parse time (M3), queue sentences ahead, no per-utterance DB read |
| **APK size (release)** | < 40 MB (per `phase-2.md:2`) | `ls -lh android/app/build/outputs/apk/release/app-release.apk` | M1 (baseline), gate at M8 | Samples total < 5 MB (`phase-1.md:4`), no bundled fonts beyond `OpenDyslexic` optional, R8 + Hermes already on |

**Perf gate:** M8 fails if cold start > 2s or Library < 55 FPS on the mid-range device. No feature is "done" if it regresses a gated KPI.

---

## 3. Deployment — GitHub Open Source (Android, Not Play Store Yet)

### 3.1 Repo Layout (What Is Public)

```
/ (repo root)
├── README.md              # what Reeda is, warm preview, install from GitHub Releases, tech stack, docs index
├── LICENSE                # MIT (see 3.2)
├── CONTRIBUTING.md        # how to run, branch, PR, code style, design truth
├── CODE_OF_CONDUCT.md     # Contributor Covenant (standard)
├── SECURITY.md            # how to report vulnerabilities
├── docs/                  # this folder — design truth (phase-0 → phase-5)
│   ├── phase-0.md … phase-5.md
│   └── assets/            # optional: screenshots for README (not bundled in APK)
├── app/                   # React Native app per phase-2.md:3
│   ├── android/           # Gradle, adaptive icon from logo.svg/png
│   └── src/
├── logo.svg / logo.png    # source assets — Option 2 asymmetric lines, Warm Dark #1E1814 on light (project root for now, moved to app/assets at scaffold)
└── .github/
    ├── workflows/ci.yml            # lint + typecheck + test + assembleRelease
    └── workflows/release.yml       # tag → build → attach APK to GitHub Release
```

**What is NOT in the repo:**
- `android/app/release.keystore` + `keystore.properties` — never committed. CI uses GitHub Secrets for signing (see 3.4). A debug keystore may be committed only if it is an explicit debug keystore, not the release key.
- User-imported books — never committed; only the 2–3 public-domain samples in `assets/samples`.

### 3.2 License

**MIT** — recommended for Reeda (permissive, Play Store compatible later, minimal friction for students/religious orgs forking).

- Add `LICENSE` at repo root before first public push (copy MIT with `Copyright (c) 2026 Reeda` + year).
- Every source file gets no header — license is repo-level.
- If a dependency is GPL, it is not added — MIT repo must stay MIT-clean. `react-native-quick-sqlite` + `react-native-pdf` + `lucide-react-native` are all MIT/Apache-2.0 clean.

If you prefer Apache-2.0 over MIT, swap the file — no code change required. Lock it before first tag.

### 3.3 Branching & Releases (GitHub Flow, Tag-Based)

| Rule | Value |
|------|-------|
| Default branch | `main` — always green (CI must pass), always launchable |
| Feature branches | `feat/<short-name>` or `fix/<short-name>` from `main`, PR back to `main` with at least one review + CI green. No direct push to `main` after M1 |
| Versioning | Semantic: `v0.1.0` → `v0.2.0` → `v1.0.0`. Pre-1.0 while MVP is not Play Store ready. Tag drives a release |
| Changelog | `CHANGELOG.md` at root (Keep a Changelog format) — updated per PR that is user-facing. CI checks it is touched when `app/src` changes after M2 |
| Release artifacts | Every tag `v*` builds a **signed release APK** (`app-release.apk`) + optional `app-release.aab` and attaches both to the **GitHub Release** with notes + SHA-256. No Play Store upload. Users install via `Releases → Assets → app-release.apk` (enable "Install unknown apps" on Android) |
| Pre-releases | Tags `v0.x.y-rc.N` are GitHub pre-releases — same APK, marked as pre-release, for tester group before a stable tag |

### 3.4 CI / CD (GitHub Actions — What Runs When)

**`ci.yml` — on every push + PR to `main`:**

| Job | Command | Fails If |
|-----|---------|----------|
| `lint` | `npm run lint` (ESLint + Prettier check) | Any lint error |
| `typecheck` | `tsc --noEmit` (strict per `phase-2.md:1`) | Any type error |
| `test` | `npm test -- --ci` (Jest + RNTL) | Any unit/component/integration failure |
| `assembleDebug` | `./gradlew assembleDebug` (no signing) | Gradle failure |
| `dead-code-check` | Script per `phase-4.md:5` — list files not imported by any file reachable from `App.tsx` → fail if not allowlisted in `phase-4.md:6` | Undeclared dead code |

**`release.yml` — on tag `v*`:**

| Step | What Happens |
|------|--------------|
| Checkout + setup Node 20 + JDK 17 | Standard |
| Decode release keystore from GitHub Secret `RELEASE_KEYSTORE_BASE64` → `android/app/release.keystore` + write `android/gradle.properties` from Secrets `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` | No keystore in repo |
| `npm ci` + `npm test` + `tsc --noEmit` | Gate — no APK if tests/type fail |
| `./gradlew assembleRelease` + `./gradlew bundleRelease` | Produces `app-release.apk` + `app-release.aab` (AAB kept for future Play Store, not uploaded now) |
| Compute `sha256sum` for APK | Shown in Release notes for sideload verification |
| `softprops/action-gh-release` | Creates GitHub Release from tag, attaches APK (+ AAB), with notes from `CHANGELOG.md` section for that version |

**Secrets required (set in GitHub → Settings → Secrets and variables → Actions):**
- `RELEASE_KEYSTORE_BASE64` — `base64 -w 0 android/app/release.keystore` output (generate once locally, never commit).
- `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` — matching `release.keystore`.

**No Play Store secrets yet.** When Play Store is later enabled, add a separate `play-store.yml` with `r0adkll/upload-google-play` and a service-account JSON secret — not in this phase.

### 3.5 README — What It Must Contain (Before First Public Push)

- **Hero:** Reeda name + one-line pitch from `phase-0.md:3` + logo (Option 2, Warm Dark on light hero, 240px wide).
- **Preview:** 2 screenshots (Library grid + Reader with Rectangular Menu collapsed/expanded — matching `603d5406845a0ef07254c5da1dbf5b1f.jpg` style).
- **Install (Android):** "Download the latest APK from Releases → enable Install unknown apps → open" — with SHA-256 verify step.
- **Tech:** Bare RN + TypeScript + Hermes + Zustand + SQLite (`react-native-quick-sqlite`) + `react-native-pdf` (wrapping PDFium) per `phase-2.md:1`.
- **Formats:** EPUB, PDF, TXT, MOBI (per `phase-1.md:3.1`).
- **Docs index:** links to `docs/phase-0.md` → `phase-5.md`.
- **License + Contributing:** pointers to `LICENSE` + `CONTRIBUTING.md`.

### 3.6 What Is NOT Done in This Phase (Play Store Prep, But Not Ship)

The following are prepared for but **not executed** now — they are the explicit future Play Store lane so the repo is not polluted with half-configured store assets:

| Deferred Item | Why Deferred | When It Happens |
|---------------|--------------|-----------------|
| `android/app/src/main/play/` listing (screenshots, feature graphic, store copy) | Play Console not opened yet | Future `phase-6` (or `phase-5 — Play Store addendum`) |
| `upload-google-play` action + service account | No Play Console project yet | Same |
| `privacyPolicyUrl` + `termsUrl` hosting | Draft in `phase-1.md:5.3/5.4` but URL not bought/verified yet | Before Play submission |
| In-app update / Play Integrity | Not needed for GitHub sideload | Same |
| Closed testing track / staged rollout | No Play Console | Same |

---

## 4. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation | Phase Where Mitigation Lands |
|---|------|------------|--------|------------|------------------------------|
| R1 | PDF text selection not exposed by `react-native-pdf` (only render) | Medium | High — breaks `3.4.1` selection + TTS `hasTextLayer` | Verify at M3 scaffold (see `phase-2.md:8.2 #2`). Fallback: fork or drop to raw PDFium + custom bridge (still same `PdfView` API, no app-level rewrite). Decision log entry in `phase-2.md:8.1` | M3 |
| R2 | EPUB parsing slow on low-end API 24 | Medium | Medium — import progress feels frozen | Parse on background thread per `phase-2.md:7` (`InteractionManager` / thread), show per-file progress row per `phase-1.md:6.1`, not a blocking modal | M2/M5 |
| R3 | Library jank at 1000+ books despite `FastImage` | Medium | High — violates 60 FPS gate | `getItemLayout` + `windowSize` 7 + memoized `BookCard` per Section 2; seed 1000 rows at M2 and measure at M8 | M8 |
| R4 | Scope creep — "Apple Books has X, add X now" pulls in store/catalog/sync | High | High — delays MVP + reopens legal (`phase-1.md:5`) | `phase-0.md:7` out-of-scope is the gate. Any store/catalog/sync request must update `phase-1.md` + `phase-2.md:8.1` + legal review before code | Every milestone gate |
| R5 | Keystore lost or committed | Low | Critical — cannot update GitHub Releases (APK signature mismatch) or future Play Store | Generate once, store only in GitHub Secrets + offline backup (not in repo). `ci.yml` never logs secret values. Documented in 3.4 | M1 |
| R6 | TTS quality/coverage varies across OEMs (Xiaomi vs Pixel) | High | Medium — sleep timer + highlight sync feel broken on some devices | Use platform `TextToSpeech` + voice picker per `phase-3-reader.md:3.9`, fallback "Install TTS engine" prompt per `phase-1.md:3.3` + `3.9` table, test on 3 devices per 1.1 | M6 |
| R7 | Scope of MOBI (T/M/B: legacy format) underestimated | Low | Low — parser edge cases | Accepted per `phase-2.md:8.1` as best-effort EPUB subset. Failure path is already "Unsupported file" / descriptive error per `phase-1.md:3.3`, not a crash | M3/M5 |
| R8 | Asymmetric logo fails at small size (Option 2 thin lines) | Low | Medium — Play icon / adaptive icon unreadable | Logo already chosen (Option 2, `logo.svg/png`). Test at 48dp + 24dp monochrome in M1 adaptive-icon generation; if thin, bump spine + horizontals from 1.5dp to 2dp in icon only (app uses 1.5dp) | M1 |
| R9 | GitHub Releases APK sideload friction (users fear "unknown apps") | Medium | Medium — lower adoption than Play Store | README install steps + SHA note (3.5), keep APK < 40 MB (Section 2), publish a short demo video in Releases. Play Store remains the future lane — not forced now | M8 |

---

## 5. What Is Out of Scope for This Doc

- **Detailed screen-by-screen UI** — `phase-3.md` + `phase-3-reader.md` remain the design truth; this doc does not restyle them.
- **Data model / navigation / stack** — `phase-2.md` is the architecture truth; this doc does not re-decide them.
- **Roadmap order** — `phase-4.md` is the build order + wiring truth; this doc does not reorder milestones. Milestones M1→M8 are referenced here for when each test/perf/deployment lever lands.
- **Store listing production** — screenshots, feature graphic, store copy, Privacy URL hosting are deferred per Section 3.6.

---

## 6. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | Complete |
| `docs/phase-2.md` | Technical Architecture | Complete |
| `docs/phase-3.md` | Design Spec — Home/Library | Complete |
| `docs/phase-3-reader.md` | Design Spec — Reader + Menu | Complete |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | Complete |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | **Complete (this doc)** |

---

## 7. How to Use This Document

- **Developers / AI Agents:** Milestone gates in `phase-4.md:4` (J1–J12) are the definition of done — this doc tells you how to *prove* each gate (tests in 1.1, perf in Section 2, devices in 1.1). CI in 3.4 is the automated gate for `main` + every tag. If CI fails, `main` is not green and no Release is cut. No APK is built if `typecheck` or `test` fails.
- **Designers:** Logo Option 2 is locked (`logo.svg/png`), warm palette is locked (`phase-3.md:8`). Adaptive icon is the only design artifact in this phase — test it at 48dp (see R8).
- **Maintainers:** Keep `LICENSE` MIT unless a dependency forces a change. Keep Releases on GitHub (3.3) — do not open a Play Console project until `phase-1.md:5.3/5.4` Privacy/Terms URLs are human-reviewed and hosted.
