# Phase 3 — Design Specification

> **Purpose:** Define every visual and interaction detail for the app's screens so a designer can produce pixel-perfect mockups and a developer (or AI agent) can implement them faithfully.
> **Scope:** This document is DESIGN DOCUMENTATION ONLY. No code belongs in this document. Coding belongs in the development phase.
> **Platform:** Android (primary target)
> **Tech Stack:** React Native (confirmed — no native engine)
> **Reference Image:** `603d5406845a0ef07254c5da1dbf5b1f.jpg` (project root) — this is the visual north star for the home page.
> **Last Updated:** 2026-09-11

---

## 1. Design Philosophy

The app should feel like a **premium physical book collection** — warm, calm, and inviting. Think: a well-lit personal library with clean shelves. The aesthetic is:

- **Minimal** — no visual clutter, every element earns its place
- **Warm** — cream/beige tones, not stark white or cold gray
- **Typographic** — text is the hero, not decorative elements
- **Comfortable** — designed for extended reading sessions (low contrast options, generous spacing)

---

## 2. Design Tokens

Design tokens are the single source of truth for colors, type, spacing, and shapes. Every element in every screen must reference these tokens.

### 2.1 Color Palette

| Token Name | Value | Usage |
|------------|-------|-------|
| `bg-primary` | `#F0EDE6` | Main app background — warm cream |
| `bg-card` | `#FFFFFF` | Card surfaces (book cards, content cards) |
| `bg-card-dark` | `#1C1C1E` | Dark stat/widget cards (Reading Goals, Bookmarks) |
| `bg-search` | `#E8E4DC` | Search input field background |
| `bg-overlay` | `#000000` at 40% opacity | Modal/backdrop overlays |
| `text-primary` | `#2C2C2E` | Headings, book titles, primary text |
| `text-secondary` | `#8B8680` | Author names, genre labels, metadata |
| `text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `text-inverse-secondary` | `#A1A1A6` | Secondary text on dark backgrounds |
| `accent-progress` | `#FFFFFF` | Progress bar fill (on light cards) |
| `accent-progress-dark` | `#FFFFFF` | Progress bar fill (on dark cards) |
| `accent-track` | `#D9D4CC` | Progress bar track/background |
| `button-primary-bg` | `#FFFFFF` | Primary button background |
| `button-primary-text` | `#2C2C2E` | Primary button text |
| `divider` | `#D9D4CC` | Separator lines |
| `icon-tint` | `#8B8680` | Icon color (search, filter, etc.) |
| `icon-tint-inverse` | `#FFFFFF` | Icon color on dark backgrounds |
| `avatar-bg` | `#8B8680` | Default avatar background |
| `shadow-color` | `#000000` | All shadows use this color |

### 2.2 Typography

| Token Name | Font Family | Size (sp) | Weight | Line Height | Usage |
|------------|-------------|-----------|--------|-------------|-------|
| `font-display` | System Sans (SF Pro / Roboto) | 22 | Semi-Bold (600) | 28 | Screen titles ("My Library") |
| `font-heading` | System Sans | 18 | Semi-Bold (600) | 24 | Section headers ("Continue Reading", "Book Collection") |
| `font-title` | System Sans | 14 | Semi-Bold (600) | 18 | Book titles in cards |
| `font-body` | System Sans | 13 | Regular (400) | 17 | Author names, metadata, descriptions |
| `font-caption` | System Sans | 11 | Regular (400) | 14 | Genre labels, secondary info, "5 columns" |
| `font-button` | System Sans | 13 | Semi-Bold (600) | 16 | Button text ("RESUME") |
| `font-stat-large` | System Sans | 28 | Bold (700) | 34 | Stat numbers ("38", "14", "212") |
| `font-stat-label` | System Sans | 14 | Semi-Bold (600) | 18 | Stat card labels ("Reading Goals", "3 active") |
| `font-stat-unit` | System Sans | 14 | Regular (400) | 18 | Stat units ("min/day", "Chapter 14") |

**Notes:**
- Use the device's native system font (SF Pro on Samsung, Roboto on Pixel, etc.) — do not bundle a custom font for MVP.
- All sizes are in `sp` (scalable pixels) to respect user font-size preferences.

### 2.3 Spacing & Layout Grid

| Token Name | Value | Usage |
|------------|-------|-------|
| `space-xs` | 4 | Tiny gaps |
| `space-sm` | 8 | Icon-to-label gaps |
| `space-md` | 12 | Intra-card gaps |
| `space-lg` | 16 | Card internal padding, gap between grid items |
| `space-xl` | 20 | Screen horizontal padding |
| `space-2xl` | 24 | Gap between sections |
| `space-3xl` | 32 | Large section gaps |
| `space-4xl` | 48 | Spacing around major blocks |

**Screen Layout Grid:**
- Screen horizontal padding: `space-xl` (20) on both left and right
- Status bar height: System-controlled (approximately 24–48 depending on device)
- Top nav bar height: Approximately 56 (excluding status bar)
- Minimum touch target: 48 x 48 (Android accessibility standard)

### 2.4 Shape & Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| `radius-sm` | 8 | Small elements (progress bars, badges) |
| `radius-md` | 12 | Standard cards, buttons |
| `radius-lg` | 16 | Large cards, image containers |
| `radius-full` | 9999 | Pill shapes (buttons, avatars, search bar) |

### 2.5 Elevation (Shadows)

| Token Name | Shadow Spec | Usage |
|------------|-------------|-------|
| `shadow-xs` | 0px 1px 3px alpha 0.08 | Subtle card lift |
| `shadow-sm` | 0px 2px 8px alpha 0.10 | Standard cards |
| `shadow-md` | 0px 4px 16px alpha 0.12 | Elevated cards, modals |
| `shadow-lg` | 0px 8px 32px alpha 0.16 | Overlays, bottom sheets |

**Notes:**
- Use Android-consistent shadow rendering. On Material You devices, adapt to dynamic color elevation.
- Do not over-shadow. The design is flat-minimal — shadows should be subtle.

### 2.6 Iconography

| Property | Value |
|----------|-------|
| **Icon Pack** | Lucide (`lucide-react-native`) |
| **Style** | Outlined (stroke only, no fill) — clean, modern, consistent |
| **Stroke Width** | 1.5dp (Lucide default — uniform across all icons) |
| **Line Caps** | Rounded (`round`) |
| **Line Joins** | Rounded (`round`) |
| **Default Size** | 20dp–24dp (context-dependent) |
| **Color** | Tinted via `color` prop — `icon-tint`, `icon-tint-inverse`, or custom |
| **Flipped/Mirrored** | Supported via `transform` prop for RTL or directional needs |
| **Animated** | Supported via `Reanimated` for press/hover states (scale, opacity) |

**Why Lucide:** Single consistent stroke weight across every icon. Modern aesthetic. Actively maintained. Ship with React Native via `lucide-react-native`. No mixed weights, no inconsistent style — one pack, one look, every icon.

**Required Icons (MVP) — grouped by screen:**

*Top Navigation:*
- Search (`Search`) — top nav
- Filter/Sliders (`SlidersHorizontal`) — top nav
- Chevron Left/Right (`ChevronLeft`, `ChevronRight`) — menu toggle, navigation

*Library/Home:*
- Bookmark (`Bookmark`) — book cards, reader
- Heart (`Heart`) — want to read
- Library/Boxes (`Library`) — collections
- Clock (`Clock`) — recently added, stats
- User (`User`) — profile avatar

*Reader Menu (12 items):*
- Book Open (`BookOpen`) — Chapters/Table of Contents
- Bookmark (`Bookmark`) — Bookmarks
- Highlighter (`Highlighter`) — Highlights
- Pencil (`Pencil`) — Notes
- Volume 2 (`Volume2`) — Read Aloud
- Search (`Search`) — Search in Book
- Type (`Type`) — Font & Theme
- Rows 3 (`Rows3`) — Page Thumbnails
- Bar Chart 3 (`BarChart3`) — Progress
- Share 2 (`Share2`) — Share
- Languages (`Languages`) — Dictionary
- Settings (`Settings`) — Reader Settings

*Reader Toolbar & TTS Controls:*
- Play (`Play`) — TTS start
- Pause (`Pause`) — TTS pause
- Skip Forward (`SkipForward`) — TTS skip ahead
- Skip Back (`SkipBack`) — TTS skip back
- Clock (`Clock`) — Sleep timer
- Gauge (`Gauge`) — Speed control
- Rotate CW (`RotateCw`) — Orientation toggle
- Sun (`Sun`) / Moon (`Moon`) — Theme toggle
- Zoom In / Zoom Out (`ZoomIn`, `ZoomOut`) — PDF zoom
- Refresh / Circle (`RefreshCw`) — Reset zoom
- Copy (`Copy`) — Copy text
- Check (`Check`) — Confirm/Done
- Plus (`Plus`) — FAB, add new
- X (`X`) — Close, dismiss
- More Horizontal (`MoreHorizontal`) — Options menu
- Trash 2 (`Trash2`) — Delete action
- Arrow Up / Down (`ArrowUp`, `ArrowDown`) — Scroll/navigate
- Upload/Download (`Upload`, `Download`) — Import/export

---

## 3. Home Screen — Full Specification

> This is the screen shown in the reference image `603d5406845a0ef07254c5da1dbf5b1f.jpg`.
> **Screen Name:** Home / Library
> **Navigational Role:** Primary entry point. Tab 1 of the bottom navigation (if bottom nav is adopted) or root screen.

### 3.1 Screen Structure (Top to Bottom)

The home screen is a **vertical scrollable layout** composed of the following blocks in order:

```
[Status Bar]
[Top Navigation Bar]
[Continue Reading Section]
[Book Collection Section]
[Stats Widget Bar (dark)]
[Recently Added Section]
[Bottom Safe Area]
```

### 3.2 Status Bar

- **Content:** Time (left), signal/WiFi/battery (right)
- **Style:** System default — do not customize
- **Background:** Blends with `bg-primary` (transparent/translucent)
- **Text/Icons:** System default colors (auto-switch light/dark based on status bar icons)

### 3.3 Top Navigation Bar

**Height:** 56dp (below status bar)
**Background:** `bg-primary` (transparent — the cream background shows through)
**Elevation:** None (flat, no shadow)
**Layout:** Horizontal, vertically centered

**Left Component — Search Field:**
- Type: Rounded rectangle input field
- Background: `bg-search` (`#E8E4DC`)
- Border Radius: `radius-full` (pill shape)
- Height: 40dp
- Width: Fills remaining space to the left of the icons
- Padding: `space-md` (12) horizontal inside
- **Left icon:** Search (`Search`, Lucide), 20dp, `icon-tint` color
- **Placeholder text:** "Search" — `font-caption` style, `text-secondary` color
- **Hint/Placeholder behavior:** When empty, shows "Search". When typing, text is editable, cursor is `text-primary` color.
- **Tap behavior:** Opens search overlay or navigates to search screen (to be defined)
- **Right side of search field:** The text "My Library" is centered within or adjacent to the search area. This is the screen title.

**Title — "My Library":**
- Position: Centered horizontally within the nav bar (or aligned between search and icons)
- Style: `font-display` (22sp Semi-Bold), `text-primary` color
- Does not scroll or shrink

**Right Components:**
1. **Filter Icon:**
   - Icon: SlidersHorizontal (`SlidersHorizontal`, Lucide), Funnel/filter shape
   - Size: 24dp
   - Color: `icon-tint` (`#8B8680`)
   - Position: To the right of the search field, with `space-lg` (12) gap
   - Tap behavior: Opens filter/sort menu (to be defined)

2. **Profile Avatar:**
   - Shape: Circle, diameter 36dp
   - Background: `avatar-bg` (`#8B8680`)
   - Content: Letter "S" (user initial) — `text-inverse` color, `font-body` Semi-Bold, centered
   - Position: To the right of filter icon, with `space-md` (12) gap
   - Tap behavior: Opens profile/account menu (dropdown or bottom sheet — to be defined)

### 3.4 Continue Reading Section

**Section Header:**
- Text: "Continue Reading"
- Style: `font-heading` (18sp Semi-Bold), `text-primary`
- Position: Left-aligned, with `space-xl` (20) from screen edge
- Top margin: `space-2xl` (24) from nav bar

**Card — Single Item (Horizontal Scroll):**
- **Dimensions:** Full screen width minus horizontal padding (screen width − 40dp), height approximately 140dp
- **Background:** `bg-card` (`#FFFFFF`)
- **Border Radius:** `radius-lg` (16)
- **Shadow:** `shadow-sm`
- **Layout:** Horizontal row — cover image on left, content on right
- **Internal Padding:** `space-lg` (12) all around

**Within Continue Reading Card:**

| Element | Size | Style | Position |
|---------|------|-------|----------|
| Book Cover | 80dp x 110dp | Rounded `radius-md` (12), cover image centered, slight shadow `shadow-xs` | Left side of card, centered vertically |
| Content Column | Fills remaining width | — | Right of cover, `space-md` (12) gap from cover |
| Title | — | `font-title` (14sp Semi-Bold), `text-primary` | Top of content column |
| Author | — | `font-body` (13sp Regular), `text-secondary` | Below title, `space-xs` (4) gap |
| Progress Bar | Width: fills column, Height: 4dp | Track: `accent-track` (`#D9D4CC`), `radius-sm` (8). Fill: `accent-progress` (`#FFFFFF`) — **white fill on the cream/warm background of card — note: in the reference image, the progress bar appears as a light/white thin bar** | Below author, `space-md` (12) gap |
| Percentage Label | — | `font-caption` (11sp Regular), `text-secondary` | Right-aligned, aligned with progress bar center |
| RESUME Button | Height: 36dp, Width: wraps content | Background: `button-primary-bg` (`#FFFFFF`), Border Radius: `radius-full` (pill), Text: `font-button` (13sp Semi-Bold), `button-primary-text` (`#2C2C2E`). Padding: `space-lg` left/right (16) | Below progress bar, `space-md` (12) gap, left-aligned within content column |

**Horizontal Scroll:**
- Direction: Horizontal (left to right)
- Shows one card at a time (peek may show edge of next card — TBD)
- Snap behavior: Snap to center (each card centers on screen)
- Padding: `space-xl` (20) left/right so first/last cards aren't flush to edge
- Shows: 1 Continue Reading item (for MVP; expandable to multiple later)

### 3.5 Book Collection Section

**Section Header Row:**
- **Left:** "Book Collection" — `font-heading` (18sp Semi-Bold), `text-primary`
- **Right:** "5 columns" — `font-caption` (11sp Regular), `text-secondary`
- **Position:** Left and right aligned respectively, with `space-xl` (20) from screen edges
- **Top margin:** `space-3xl` (32) from Continue Reading section

**Grid:**
- **Columns:** 5 (fixed)
- **Gap between items:** `space-md` (12) horizontal and vertical
- **Total width:** Screen width − (2 × `space-xl` horizontal padding) − (4 × `space-md` gaps)
- **Column width:** Calculated dynamically: (screen width − 40 − 48) / 5
- **Scroll:** Vertical (infinite scroll as library grows)

**Grid Cell (Book Card):**

Each cell contains:

| Element | Size | Style | Notes |
|---------|------|-------|-------|
| Book Cover | Fills cell width, aspect ratio ~3:4 (width to height) | Rounded `radius-md` (12), `bg-card`, slight shadow `shadow-xs` | Cover image fills the area, centered, may have rounded top corners or full cover |
| Title | Full width, wraps to 2 lines max | `font-title` (14sp Semi-Bold), `text-primary` | Below cover, `space-sm` (8) gap |
| Author/Genre | Full width, single line (truncate if needed) | `font-caption` (11sp Regular), `text-secondary` | Below title, `space-xs` (4) gap |
| Progress Bar | Full width, Height: 3dp | Track: `accent-track`, Fill: `accent-progress` (white/light) | Below author, `space-sm` (8) gap |
| Percentage | Right-aligned | `font-caption` (11sp Regular), `text-secondary` | Aligned to the right of or near progress bar |

**Cell Layout Order (top to bottom):**
```
[Cover Image]
[Title]
[Author / Genre]
[Progress Bar ............ 43%]
```

**Cell Touch Target:**
- Entire cell is tappable
- Tap behavior: Navigate to Book Details page (to be defined) or open reader (to be defined — likely details first)
- Ripple effect: Android default touch feedback on cell background

**Example Content from Reference Image:**
Row 1: Atomic Habits (76%), Educated (54%), The Midnight Library (91%), Dune (12%), [5th partially visible]
Row 2: Circe (67%), Sapiens (43%), The Silent Patient (88%), Klara and the Sun (30%), [5th partially visible]
Row 3: [partial], [partial], Project Hail Mary (72%), Where the Crawdads Sing (59%), [partial]

### 3.6 Stats Widget Bar (Dark Section)

**Background:** `bg-primary` (cream, continues from above)
**Top margin:** `space-3xl` (32) from Book Collection section
**Layout:** Horizontal row, two cards side by side
**Gap between cards:** `space-lg` (12)

**Card 1 — Reading Goals:**
- **Dimensions:** Approximately 48% of available width, height ~120dp
- **Background:** `bg-card-dark` (`#1C1C1E`)
- **Border Radius:** `radius-lg` (16)
- **Shadow:** `shadow-sm`
- **Internal Padding:** `space-lg` (12)
- **Layout:** Vertical column, left-aligned

| Element | Style | Position |
|---------|-------|----------|
| Label | "Reading Goals" — `font-stat-label` (14sp Semi-Bold), `text-inverse` | Top |
| Value | "38" — `font-stat-large` (28sp Bold), `text-inverse` + "min/day" — `font-stat-unit` (14sp Regular), `text-inverse-secondary` on same baseline | Below label, `space-sm` gap |
| Progress Bar | Full width, Height: 4dp. Track: `#3A3A3C`, Fill: `#FFFFFF` | Below value, `space-md` gap |

**Card 2 — Bookmarks:**
- **Dimensions:** Approximately 48% of available width, same height as Card 1
- **Background:** `bg-card-dark` (`#1C1C1E`)
- **Border Radius:** `radius-lg` (16)
- **Shadow:** `shadow-sm`
- **Internal Padding:** `space-lg` (12)
- **Layout:** Vertical column

| Element | Style | Position |
|---------|-------|----------|
| Label | "Bookmarks" — `font-stat-label` (14sp Semi-Bold), `text-inverse` | Top |
| Row 1 | "3 active" — `font-body` (13sp Regular), `text-inverse-secondary` on left. "14" — `font-stat-large` (28sp Bold) or `font-body` size — on right, `text-inverse` | Below label |
| Row 2 | "Chapter 14" — `font-body` style left, "212" right | Below Row 1, `space-xs` gap |
| Row 3 | "Note" — `font-body` style left, "5" right | Below Row 2, `space-xs` gap |

**Notes on Stats Layout:**
- Each row in Bookmarks card has left text and right number, space between them
- Numbers are right-aligned and visually prominent (white/bold)
- Labels are smaller and dimmer (grey/regular)

### 3.7 Recently Added Section

**Section Header Row:**
- **Left:** "Recently Added" — `font-heading` (18sp Semi-Bold), `text-primary`
- **Right:** "All" — `font-body` (13sp Regular), `text-secondary`. Tappable (navigates to full library list)
- **Position:** Left and right aligned, `space-xl` from screen edges
- **Top margin:** `space-3xl` (32) from Stats section

**Content:**
- Horizontal scroll of book cards (similar to Book Collection cells but wider)
- Each card: Cover image (larger, ~100dp wide, 140dp tall), title below, possibly author
- Shows: Last 5–10 added books
- Scroll direction: Horizontal
- Gap between cards: `space-lg` (12)

### 3.8 Bottom Safe Area

- Respect Android system navigation bar (gesture or 3-button)
- Minimum bottom padding: `space-md` (12) after last content element
- If bottom navigation is adopted, it occupies this space

### 3.9 Library Search Experience — Added 2026-09-11

> **Additive only.** Defines the `TBD` in `4` (`Search → [Search Screen — TBD]`) without changing Home layout (`3.1`–`3.8`), tokens (`2`), or nav spine (`phase-2.md:4`). Distinct from **In-Book Search** (`phase-3-reader.md:172,Item 6` — search *within* the opened book); this is **Library Search** — search *across* the bookshelf by `title + author + genre + shelf` via `books_fts` (`phase-2.md:5.1.1`).

#### 3.9.1 Entry — Top Navigation Pill (extends `3.3`)

| Property | Value |
|----------|-------|
| **Pill** | Same as `3.3`: `bg-search #E8E4DC`, `radius-full`, `40dp` height, `Search` Lucide `20dp` `icon-tint`, placeholder `"Search"` `font-caption` `text-secondary`. Title `"My Library"` remains centered per `3.3` — not moved. |
| **Tap** | Navigates to **Library Search Screen** (full-screen route `LibraryStack/Search`, `headerShown: false`) — not an overlay. Preserves `LibraryScreen` `FlatList` position via `React Query ['books',search]` cache. Back returns to same scroll offset. |
| **Alternative entry** | Keyboard shortcut not in MVP. No bottom-tab search. |

#### 3.9.2 Library Search Screen — Layout

| Property | Value |
|----------|-------|
| **Type** | Full-screen `native-stack` screen, `bg-primary #F0EDE6`, status bar visible (not immersive), respects safe areas `space-xl` horizontal padding. |
| **Header** | Height `56dp`, `bg-primary`. Left: back `ChevronLeft` `24dp` `icon-tint` (tap → `navigation.goBack()`). Center: search field `bg-search`, `radius-full`, `40dp` height, auto-focus + keyboard up on enter (`autofocus: true`, `autocorrect: true`, `autoCapitalize: none`). Right: `X` `20dp` `icon-tint` (visible only when input non-empty, tap → clear + show recents). No filter icon here — facets are below. |
| **Below header** | Facet chips row: `All \| Title \| Author \| Genre \| Shelf` — `Pill` `32dp` height, `space-sm` gap, horizontal scroll if needed. `All` selected by default; single-select. Unselected: `bg-search` `text-secondary`; Selected: `bg-card-dark #1C1C1E` `text-inverse`. Maps to FTS column filter (`phase-2.md:6.1`: `All` → global `MATCH`, `Author` → `author:query*`). Chips are additive to `FilterSheet` — `FilterSheet` (sort/filter in `3.3` right `SlidersHorizontal`) still exists for shelf/status sorting after search. |
| **Content area** | `FlatList` of results below chips, `space-lg` gap, padding `space-xl` horizontal. Uses same `BookCard` cell as `3.5` (cover `3:4`, title `font-title`, author `font-caption`, progress bar `3dp` + `%`) but with **secondary cue**: genre/shelf label under author (`font-caption` `text-secondary`) so comparison needs no open. Reuses `FastImage` + `getItemLayout` for 60 FPS. |
| **Result count** | Header count `"14 results for \"dune\""` — `font-caption` `text-secondary`, `space-md` top padding, announced via TalkBack. |
| **Highlight** | Matched prefix in title/author bolded `font-title Semi-Bold` and `bg-primary` subtle `accent-track` highlight (not FTS `offsets()`). Simple string split on sanitized tokens → stable, no jank. |

#### 3.9.3 States & Behaviors

| State | Visual | Spec |
|-------|--------|------|
| **Empty query (recents)** | Shows `Recent searches` section (if any): `Clock` Lucide `16dp` `icon-tint` + 5–10 capped rows (`font-body` `text-primary`, tap → fills field and searches). Below: `Suggestions` — e.g., `"Try: Atomic Habits, Educated, Dune"` (`font-body` `text-secondary`). History stored per `5.1.1` `search_history` (local-only, capped, evicted oldest) via `settings` or new `search_history` table (`query`, `searchedAt`). Clear all action `Trash2` at end of recents header. No network suggestions. | `History` limited to `10` (MVP), capped per `dictionary_history` pattern. |
| **Typing (live)** | As user types, suggestions dropdown below field shows up to `8` autocomplete rows: matching title/author prefix (`font-body` `text-primary` with bold prefix, secondary `font-caption` `text-secondary` author/genre). Paper background `bg-card` `radius-md` `shadow-sm`. Debounced `150ms` + stale cancel (`phase-2.md:6.1`) — prevents flicker. Queries `<2 chars` skip FTS and keep recents (no `a*` scan). | `Sanitize` per `5.1.1` `ftsPrefixQuery`; `fuzzy/typo` handled by prefix `term*`; no Levenshtein in MVP. |
| **Results** | Grid of `BookCard` (5 columns portrait per `3.5`; search results use same grid; small screens 4 cols per `6` adaptive). Tap → `BookDetails` → `Reader` (existing spine). | `ORDER BY bm25` (relevance) when query non-empty; when cleared, reverts to user sort (`Title/Author/Recent`) from `libraryStore`. |
| **No results** | Center message: `"No books found for \"xyz\""` — `font-heading` `text-primary`. Below: `font-body` `text-secondary` suggestions: `"Check spelling, try author or genre, or"` + tappable popular queries (e.g., `Clear search` pill `radius-full` `bg-card` `shadow-sm`). Below still shows `All` facet row (can retarget to `Author`/`Genre`). | Does **not** offer store/catalog purchase (`phase-0.md:108,7` still out). |
| **Loading** | Skeleton `BookCard` placeholders (`cream rounded rects` per `5.3`) or spinner in field (12dp). FTS is `8–25ms` so spinner rarely shows. | No extra overlay. |

#### 3.9.4 Interactions & Accessibility

| Concern | Spec |
|---------|------|
| **Keyboard** | Auto-show on screen enter, `autocorrect` on, `returnKeyType="search"` → submit. Pressing `Search` on keyboard same as typing debounce — no duplicate query. |
| **Back gesture** | Hardware back while keyboard up → dismiss keyboard first, second back → close Search and return to Library. Dim overlay not needed (full screen). |
| **Touch feedback** | Chips and rows use Android ripple + `48dp` min target (`phase-3.md:7`). Top field `X` and back are `40–48dp`. |
| **TalkBack** | Field labeled `"Search books by title, author, genre or shelf"`; count announced `"14 results"`; each card announces `"Title by Author, progress 43%"`. |
| **Reduced motion** | Chip select `100ms` fade, not slide. Respects system reduce-motion. |
| **Sorting after search** | `Filter/Sort` `SlidersHorizontal` bottom sheet still available while in search — filtering by shelf/status further narrows `BookRepository.filter()` after FTS. Search + filter composable via `['books', sort, filter, search]` key. |

> **Implementation note:** `SearchBar` component in `features/library/components/SearchBar.tsx` (built `M2` per `phase-4.md:89`) is the single source — it renders as pill in `LibraryScreen` TopNav *and* as header in `LibraryStack/Search`. No second search component. Styling reads from `shared/theme/tokens.ts` only — no hardcoded hex.

---

## 4. Navigation Structure (High-Level)

> This is a navigational map, not screen specifications. Screen-level design specs will be written as each screen is planned.

```
HOME / LIBRARY (this document)
├── Search → [Search Screen — TBD]
├── Filter/Sort → [Filter Sheet — TBD]
├── Profile → [Profile Menu — TBD]
├── Book Cell (tap) → BOOK DETAILS (TBD)
│   └── "Open" action → READER (TBD — planned after next reference image)
├── Continue Reading Card (tap) → READER (TBD)
│   └── "RESUME" button → READER (TBD)
├── Recently Added Card (tap) → BOOK DETAILS (TBD)
├── Stats Card (tap) → STATS DETAIL (TBD)
└── Settings/gear icon → SETTINGS (TBD)
```

---

## 5. Interaction Specifications

### 5.1 Scroll Behavior
- All vertical lists: Native Android RecyclerView-equivalent (FlatList in RN). Do not implement custom scroll engines for MVP.
- Horizontal lists: Native horizontal FlatList with snap-to-center where specified

### 5.2 Touch Feedback
- All tappable elements: Android ripple effect (Theme.Material default) or equivalent
- Buttons: Scale down to 0.95 on press (100ms animation, ease-out)
- Cards: Subtle elevation increase on press (shadow-xs → shadow-sm), 120ms animation

### 5.3 Loading States
- **Initial load:** Skeleton placeholders (cream-colored rounded rectangles matching card shapes) while book data loads
- **Image loading:** Blurred placeholder or shimmer effect while cover images load, then fade-in
- **Search results:** Loading spinner inside search field or list skeleton

### 5.4 Empty States
- **Empty library:** Show friendly illustration + "Your shelf is empty" + "Import a book" CTA button
- **No search results:** "No books found" + clear search hint
- **No continue reading:** Hide the Continue Reading section entirely (do not show empty card)

### 5.5 Animation Principles
- **Duration:** All animations 200–300ms
- **Easing:** Ease-out for entrance, ease-in-out for transitions
- **Transitions:** Screen navigation uses shared element transitions where possible (book cover expands to full reader screen — to be defined)
- **Do NOT:** Bounce, shake, or animate for the sake of animation

---

## 6. Responsive & Adaptive Considerations

| Scenario | Behavior |
|----------|----------|
| Small phones (< 360dp width) | Book Collection grid reduces to 4 columns (to be confirmed), text scales down per system font settings |
| Large phones/tablets (> 600dp width) | Book Collection can remain 5 columns but card sizes increase proportionally. Two-column layout for stats cards becomes wider |
| Landscape orientation | Book Collection grid maintains 5 columns. Continue Reading card may expand. Reader screen has different layout (TBD) |
| Foldable devices | Content reflows naturally with screen size; no special layout needed if responsive grid is used |

---

## 7. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Screen reader (TalkBack) | All interactive elements labeled: book cards announce title and author, buttons announce action ("Resume reading", "Add to bookmarks"), images have content descriptions (book title) |
| Dynamic Type | All text scales with system font size setting. Minimum effective size: 11sp. Layouts must not break at 2x scale |
| High contrast | All text meets WCAG AA contrast ratio (4.5:1 minimum for body text). Check `text-secondary` on `bg-primary` and `text-inverse` on `bg-card-dark` |
| Touch targets | Minimum 48dp x 48dp for all interactive elements (Android standard) |
| Reduced motion | Respect system "Reduce motion" setting — disable non-essential animations |
| Color blindness | Progress bars use fill width (not color-only) to indicate progress. No information conveyed by color alone |

---

## 8. Dark Mode Specification

- **MVP Status:** Light mode only (matches reference image). Dark mode is a Phase 2 feature.
- **However:** All color tokens must be defined with dark mode equivalents from the start so implementation is ready. Two dark variants are defined: **Neutral Dark** (default dark) and **Warm Dark** (warm/sepia at night — matches the app's warm beige identity, ideal for evening/religious reading):

| Token | Light Value | Neutral Dark | Warm Dark |
|-------|-------------|--------------|-----------|
| `bg-primary` | `#F0EDE6` | `#121214` | `#1E1814` |
| `bg-card` | `#FFFFFF` | `#1E1E20` | `#221C18` |
| `bg-card-dark` | `#1C1C1E` | `#0A0A0C` | `#0F0C0A` |
| `text-primary` | `#2C2C2E` | `#E8E8EA` | `#E8DCC8` |
| `text-secondary` | `#8B8680` | `#6E6E74` | `#8B7E6E` |
| `text-inverse` | `#FFFFFF` | `#E8E8EA` | `#E8DCC8` |
| `icon-tint` | `#8B8680` | `#6E6E74` | `#8B7E6E` |
| `accent-track` | `#D9D4CC` | `#3A3A3C` | `#3A332E` |
| `shadow-color` | `#000000` | `#000000` | `#000000` |

> **Note on Warm Dark:** `bg-primary` `#1E1814` is a very dark brown, `text-primary` `#E8DCC8` is a muted warm cream — intentionally the dark counterpart to the home screen's warm cream palette. See `phase-3-reader.md` Section 3.8 Section D for swatch layout.

> **Scope — App Theme vs Reading Theme (keep separate):** This section controls the **app chrome** theme (Library, navigation, cards, search bar — everything outside the book). The **reading content** theme (book text/background inside the reader) is independent and controlled separately in `phase-3-reader.md` Section 3.8 Section D. Changing a reading theme (e.g., Sepia → Warm Dark) does **not** retheme the Library. Changing the app theme here does **not** retheme the book. This matches Apple Books / Kindle separation: browse bright, read dark at night if you want. The only shared element is the token *names* — values differ per scope.

---

## 9. Assets Required (MVP)

| Asset Type | Quantity | Notes |
|------------|----------|-------|
| Book cover images | 15–20 sample | For development and testing. Mix of real book covers (for demo) and placeholders |
| User avatar | 1 | Default avatar with "S" initial (SVG or generated) |
| Empty state illustration | 1 | Friendly "empty library" illustration |
| Icons | NPM package (`lucide-react-native`) | Single package, 30+ icons used across all screens. All Lucide — stroke 1.5dp, consistent modern style. No custom icon assets needed for MVP. |
| App icon | 1 | TBD (design phase) |

---

## 10. Reader Screen Design — Separate Document

> The full reader screen and rectangular menu specification is documented in its own dedicated file.

**See:** `docs/phase-3-reader.md` — covers:
- Reading screen layout and integration with menu
- Rectangular menu specification (collapse/expand, all states)
- All 12 menu items and their overlays
- Format support matrix (EPUB, PDF, MOBI, TXT, DOCX)
- Gesture map
- Reading toolbar design
- TTS controls and mini-player

---

## 11. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | Complete |
| `docs/phase-2.md` | Technical Architecture | Complete |
| `docs/phase-3.md` | Design Spec (Home Screen) | Complete |
| `docs/phase-3-reader.md` | Design Spec (Reader Screen + Menu) | Complete |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | Complete |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | Complete |

---

## 12. How to Use This Document

- **Designers:** Use Section 2 (Design Tokens) as your Figma/Sketch variable source. Build screens using exact values from this document.
- **Developers:** Use Section 2 tokens to define your React Native theme/styles object. Build UI components matching Section 3 specifications exactly.
- **AI Agents:** Reference this document for all visual design decisions. Do NOT deviate from token values or layout specifications without updating this document.
- **All:** If anything is unclear, ambiguous, or missing — flag it as an open question and add it to the appropriate section. Do not guess.
