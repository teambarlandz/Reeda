# Phase 3 — Reader Screen & Menu Design Specification

> **Purpose:** Define the reading screen layout, the collapsible rectangular side menu, and every reading feature the app will support — matching or exceeding Apple Books feature parity.
> **Scope:** Design documentation ONLY. No code. Coding belongs in the development phase.
> **Platform:** Android (primary)
> **Tech Stack:** React Native (confirmed — no Rust/native engine)
> **Icon Pack:** Lucide (`lucide-react-native`) — stroke 1.5dp, rounded caps, modern consistent style. See `docs/phase-3.md` Section 2.6 for full icon specification.
> **Reference Images:**
> - Home Screen: `603d5406845a0ef07254c5da1dbf5b1f.jpg`
> - Menu Style: `96cbcac3221fead42ec8cc721f981424.jpg` (Rectangular menu style)
> **Last Updated:** 2026-09-11

---

## 1. Overview

The reader screen is where the actual reading experience happens. It consists of:

- **Main Reading Area:** Full-screen book content (EPUB reflowable text or PDF page display)
- **Rectangular Side Menu:** A collapsible vertical bar pinned to the left edge of the screen, providing access to all reading tools

The menu follows the **"Rectangular"** pattern from the reference image: a narrow vertical strip on the left side of the screen that expands rightward when activated and collapses back to an icon-only strip when idle.

---

## 2. Rectangular Menu — Detailed Specification

### 2.1 Menu Container

| Property | Value |
|----------|-------|
| **Position** | Pinned to the left edge of the screen |
| **Collapsed Width** | 56dp (icons only, vertically centered) |
| **Expanded Width** | 220dp (icons + labels) |
| **Height** | Full screen height (minus system status bar) |
| **Background (collapsed)** | `bg-card-dark` (`#1C1C1E`) |
| **Background (expanded)** | `bg-card-dark` (`#1C1C1E`) |
| **Border Radius** | `radius-md` (12) on the right edge only (top-right, bottom-right) |
| **Shadow** | `shadow-md` on the right side (separates from reading content) |
| **Z-Index** | Above reading content, below system overlays (keyboard, etc.) |

### 2.2 Collapse / Expand Behavior

| Action | Result | Animation |
|--------|--------|-----------|
| User taps the **menu toggle button** (hamburger or chevron icon at top of menu) | Menu transitions between collapsed ↔ expanded | Slide animation: 250ms, ease-out. Expanded content slides in from left, content area slides right to fill space |
| User taps outside the menu (on reading area) | Menu collapses (if expanded) | Same slide animation, reverse direction |
| Menu is idle for 5 seconds while expanded | Menu auto-collapses | 200ms fade + slide |
| Menu is in collapsed state | Only icon strip visible; acts as a persistent sidebar | None |

**Toggle Button:**
- Position: Top of menu bar, centered horizontally within the 56dp collapsed width
- Icon: Left chevron (`<`) when menu is collapsed; Right chevron (`>`) when expanded — `icon-tint-inverse` color (`#FFFFFF`), 20dp
- Tap target: Full 56dp width, 48dp height minimum

### 2.3 Menu Item Specifications

Each menu item consists of:
- **Icon:** 24dp, `icon-tint-inverse` color (white on dark menu)
- **Label (expanded only):** `font-body` (13sp Regular), `text-inverse` color, left-aligned with icon
- **Layout:** Icon on left, label to its right (when expanded). Icon-only when collapsed.
- **Spacing:** `space-lg` (12) between items vertically. `space-md` (12) horizontal padding within expanded menu.
- **Tap area:** Full width of menu × 48dp minimum height
- **Active state:** When a feature is active (e.g., TTS is playing), the icon gets a `#FFFFFF` background circle (24dp diameter) behind it, icon color changes to `bg-card-dark` (`#1C1C1E`). Label gets a subtle left border indicator (4dp wide, `#FFFFFF` line).
- **Disabled state:** Icons at 40% opacity (for features unavailable on current book format)

### 2.4 Menu Items — Complete List

The menu contains the following items in this exact vertical order (top to bottom):

---

#### Item 1: Table of Contents / Chapters
- **Icon:** Book Open (`BookOpen`, Lucide) — shows chapter list
- **Label:** "Chapters"
- **Feature:** Displays the book's table of contents / chapter list
- **Behavior (tap):** Opens a chapter list overlay/panel from the menu. User can tap any chapter to jump to it. Current chapter is highlighted.
- **Format support:** Full support for EPUB (structured TOC). PDF: page thumbnails with section markers if PDF has bookmarks. TXT/MOBI: manual chapter detection or user-defined markers.
- **Overlay Layout:**
  - Width: 300dp (slides out from the left, over the menu)
  - Background: `bg-card` (`#FFFFFF`)
  - Title: "Table of Contents" — `font-heading` (18sp Semi-Bold), `text-primary`
  - List item: Chapter number + title — `font-title` (14sp Semi-Bold for active, `font-body` for others), `text-primary` / `text-secondary`
  - Current chapter indicator: left border 4dp `accent-progress` (white), background `bg-card`
  - Search field at top: "Find chapter..." with magnifying glass icon
  - Close button (X): Top-right, 24dp, `icon-tint`
  - Scroll: Vertical, full list

---

#### Item 2: Bookmarks
- **Icon:** Bookmark (`Bookmark`, Lucide)
- **Label:** "Bookmarks"
- **Feature:** View and manage all page-level bookmarks
- **Behavior (tap):** Opens bookmarks list overlay from the menu.
- **Bookmark Button (in reading toolbar):** Toggles bookmark on current page. Filled = bookmarked, outline = not bookmarked.
- **Overlay Layout:**
  - Same 300dp panel style as TOC
  - List of bookmarks sorted by page/chapter
  - Each entry: Page number/chapter, snippet of text at bookmark, date added
  - Swipe left on entry: Delete bookmark (red background, trash icon)
  - Tap entry: Navigates to that page
  - Empty state: "No bookmarks yet" + hint "Tap the bookmark icon while reading"

---

#### Item 3: Highlights
- **Icon:** Highlighter (`Highlighter`, Lucide)
- **Label:** "Highlights"
- **Feature:** View all highlights and manage highlight colors
- **Behavior (tap):** Opens highlights review panel.
- **Highlight Tool (during reading):** Long-press any text → selection toolbar appears → tap highlight color → text gets colored background.
- **Highlight Colors (6 colors):**
  1. Yellow — `#FFEB3B` (default, first color selected)
  2. Green — `#4CAF50`
  3. Blue — `#2196F3`
  4. Pink — `#E91E63`
  5. Orange — `#FF9800`
  6. Purple — `#9C27B0`
- **Highlight rendering:** Selected text gets background color matching chosen highlight color. Default text color remains unchanged. Opacity: 85% (text still fully readable).
- **Overlay Layout:**
  - Grouped by color (Yellow section, Green section, etc.)
  - Each entry: Highlighted text snippet, page reference, date
  - Tap entry: Navigates to that page with highlighted text visible
  - Long-press entry: Options — copy, delete, change color
  - Color filter at top: Row of 6 color circles (selected = filled, others = outline)

---

#### Item 4: Notes
- **Icon:** Pencil (`Pencil`, Lucide)
- **Label:** "Notes"
- **Feature:** View and manage typed annotations/notes attached to pages or highlights
- **Behavior (tap):** Opens notes panel.
- **Note Creation:**
  - During reading: Long-press text → selection menu → "Note" option → opens inline text input at bottom of screen
  - Or: Tap note icon (pencil) in reading toolbar → opens note for current page
- **Overlay Layout:**
  - List of notes sorted by date (newest first) or page order
  - Each entry: Page reference, note text (2 lines max, truncate), date, attached highlight (if any)
  - Tap entry: Full note view with option to edit or delete
  - FAB (Floating Action Button) at bottom-right: Create new note for current page — circular, `bg-primary` color (`#F0EDE6`), icon: Plus (`Plus`, Lucide)

---

#### Item 5: Read Aloud (TTS)
- **Icon:** Volume 2 (`Volume2`, Lucide)
- **Label:** "Read Aloud"
- **Feature:** Text-to-speech playback of book content
- **Behavior (tap):** Toggles TTS on/off. When activated, the menu item enters ACTIVE state (see Section 2.3).
- **TTS Controls (when active — shown as mini-player at bottom of screen):**
  - Bar spans full screen width, height: 64dp
  - Background: `bg-card` (`#FFFFFF`), `radius-md` top corners
  - Shadow: `shadow-lg`
  - Contents (left to right):
    - Play/Pause button — 40dp circle, `bg-card-dark` background, Play (`Play`, Lucide) / Pause (`Pause`, Lucide) icon in white
    - Chapter/Page label — `font-body` (13sp), `text-primary` — "Chapter 3" or "Page 42"
    - Progress scrubber — thin bar, 32dp height, track `accent-track`, fill `text-primary`
    - Speed control — "1x" text button, `font-caption`, `text-secondary`. Taps cycle: 0.5x → 0.75x → 1x → 1.25x → 1.5x → 2x → 3x
    - Skip back 10 seconds — SkipBack (`SkipBack`, Lucide), `icon-tint`
    - Skip forward 10 seconds — SkipForward (`SkipForward`, Lucide), `icon-tint`
  - Dismiss: Tap X (`X`, Lucide) or swipe down
- **TTS Settings:**
  - Voice selection (system voices, language)
  - Speed (if not controlled by mini-player)
  - Highlight spoken word (toggle — syncs with text reading)
  - Sleep timer options: End of chapter, X minutes, Never
- **Format support:** EPUB (full TTS), TXT (full TTS), PDF (limited — depends on Android TTS engine PDF support), MOBI (full TTS)

---

#### Item 6: Search in Book
- **Icon:** Search (`Search`, Lucide)
- **Label:** "Search"
- **Feature:** Search for text/words within the current book
- **Behavior (tap):** Opens search bar at top of reading screen.
- **Search Bar:**
  - Appears at top of screen, slides down
  - Background: `bg-card` (`#FFFFFF`), `radius-full` (pill)
  - Height: 48dp
  - Left: Back arrow (closes search), `icon-tint`
  - Input field: "Search in [Book Title]" — `font-body`, `text-primary`
  - Right: "X" clear button (appears when typing), `icon-tint`
  - Keyboard: Opens automatically on search bar appearance
- **Search Results:**
  - Displayed in a bottom sheet (drag up from bottom)
  - Background: `bg-card` (`#FFFFFF`), `radius-lg` top corners
  - Height: 50% of screen
  - Title: "Results" — `font-heading`, `text-primary`
  - Each result: Matching text snippet with highlighted search term, page reference, context arrows
  - Tap result: Navigates to page with word centered and highlighted
  - Between results: Up/down arrow buttons — `icon-tint`
- **Search behavior:** Real-time search as user types (debounced 300ms). Case-insensitive. Supports whole words option.

> **Note — Distinction — Added 2026-09-11:** This Item 6 is **In-Book Search** (`rawTextPerChapter` index, per-book, bottom sheet results). **Library Search** (search *across* books by `title + author + genre + shelf`) is specced separately in `docs/phase-3.md:3.9` and `docs/phase-2.md:5.1.1` with `books_fts` + `bm25`. The two share sanitization (`ftsPrefixQuery`) but not UI: this stays bottom-sheet in Reader; Library Search stays full-screen `LibraryStack/Search` with recents/facets. No overlap.

---

#### Item 7: Font & Theme
- **Icon:** Type (`Type`, Lucide)
- **Label:** "Font"
- **Feature:** Customize reading appearance — font, size, spacing, theme colors
- **Behavior (tap):** Opens settings panel overlay from the menu.
- **Settings Panel Layout:**
  - Slides in from left (over the menu, 280dp wide), or appears as bottom sheet on narrow screens
  - Background: `bg-card` (`#FFFFFF`), `radius-lg`
  - Shadow: `shadow-lg`

  **Section A — Font Family:**
  - Label: "Font" — `font-title`, `text-primary`
  - Options (radio selection):
    - System Default
    - Serif (Georgia-like)
    - Sans-Serif (Roboto-like)
    - Monospace
    - **Dyslexia-Friendly** (OpenDyslexic or similar — if available; otherwise note "requires download")
  - Selection indicator: Checkmark on right side

  **Section B — Text Size:**
  - Label: "Size" — `font-title`, `text-primary`
  - Slider control: Min 12sp, Max 48sp, default 16sp
  - Minus/Plus buttons on each side of slider
  - Current value displayed: "16sp" — `font-body`, `text-secondary`

  **Section C — Spacing:**
  - Label: "Spacing" — `font-title`, `text-primary`
  - Line spacing: Slider 1.0 to 3.0, default 1.5
  - Paragraph spacing: Slider 0 to 24dp, default 12dp
  - Margins: Slider 8dp to 48dp per side, default 24dp

  **Section D — Theme:**
  - Label: "Theme" — `font-title`, `text-primary`
  - Options (visual swatches — 5 color rectangles with label):
    - Light (White `#FFFFFF`) — text: `text-primary`
    - Sepia (Warm Beige `#F0EDE6`) — text: `text-primary` (default theme matching home screen)
    - Dark (Charcoal `#1C1C1E`) — text: `text-inverse`
    - Midnight (Dark Blue `#1A1A2E`) — text: `#E0E0E0`
    - Custom: Opens color picker for background and text color
  - Selection indicator: Border highlight (2dp `accent-progress`)

  **Section E — Orientation:**
  - Label: "Orientation" — `font-title`, `text-primary`
  - Options: Auto-Rotate, Portrait, Landscape

  **Section F — Page Transition:**
  - Label: "Page Turn" — `font-title`, `text-primary`
  - Options: Slide, Fade, Curl, None

  - Bottom of panel: "Done" button — `button-primary-bg`, `button-primary-text`, `radius-full`, full width

---

#### Item 8: Page Thumbnails
- **Icon:** Rows 3 (`Rows3`, Lucide)
- **Label:** "Pages"
- **Feature:** Visual page navigation — shows thumbnails of all pages for quick browsing
- **Behavior (tap):** Opens page thumbnail grid overlay.
- **Overlay Layout:**
  - Full screen overlay with `bg-primary` (`#F0EDE6`)
  - Title bar: "Pages" — `font-heading`, close button (X) on right
  - Grid: 3 columns, gap `space-sm` (8dp), each thumbnail has page number at bottom
  - EPUB: Thumbnails are rendered page snapshots (if available) or styled page number blocks
  - PDF: Actual page thumbnails rendered from PDF content
  - Scroll: Vertical
  - Tap thumbnail: Navigates to that page
  - Current page indicator: Border highlight on active thumbnail
  - Progress: "Page 42 of 312" — `font-caption`, `text-secondary` — displayed at bottom center

---

#### Item 9: Progress
- **Icon:** Bar Chart 3 (`BarChart3`, Lucide)
- **Label:** "Progress"
- **Feature:** View detailed reading progress for the current book
- **Behavior (tap):** Opens progress summary overlay.
- **Overlay Layout:**
  - Background: `bg-card` (`#FFFFFF`), `radius-lg`, slides up as bottom sheet (60% screen height)
  - Title: "Progress" — `font-heading`, close button top-right
  - Content:
    - **Circular progress ring** — large centered ring, fill percentage, "43%" in center — `font-stat-large` Bold
    - **Details grid (2 columns):**
      - "Pages Read" — "134 / 312"
      - "Time Spent" — "3h 24m"
      - "Chapters Completed" — "7 / 18"
      - **Days Reading** — "12 days" (streak indicator)
    - **Reading Goal Section:**
      - "Goal: 30 min/day" — `font-body`
      - Today's progress bar: "25/30 min" — `accent-progress` fill
    - **Estimated Time Remaining:** "6h 15m at current pace" — `font-body`, `text-secondary`

---

#### Item 10: Share
- **Icon:** Share 2 (`Share2`, Lucide)
- **Label:** "Share"
- **Feature:** Share current book, page, or highlighted quote
- **Behavior (tap):** Opens native Android share sheet.
- **Share Options:**
  - Share book (title, author, cover, link to store/import source)
  - Share current page (page number, book reference)
  - Share selected text/highlight (the highlighted text + book reference)
  - Copy text to clipboard (always available as a "Copy" option)
- **Share content format:** ""[Highlighted text]" — from "[Book Title]" by [Author], page [X] via [App Name]''

---

#### Item 11: Dictionary
- **Icon:** Languages (`Languages`, Lucide) — look up word definitions
- **Label:** "Dictionary"
- **Feature:** Look up word definitions by tapping any word in the text
- **Behavior:**
  - **Primary interaction:** Single-tap any word in reading text → dictionary lookup
  - **Result display:** Definition appears in a floating card (bottom sheet) at the bottom of the screen
  - **Floating card:** 
    - Background: `bg-card` (`#FFFFFF`), `radius-lg` top corners, `shadow-md`
    - Height: Auto (min 120dp, max 50% screen)
    - Word: Bold, large — `font-title`, `text-primary`
    - Part of speech: `font-body`, `text-secondary`
    - Definition: `font-body`, `text-primary`
    - Example sentence: `font-body`, `text-secondary`, italic
    - Close (X): Top-right
  - **Word history:** Dictionary remembers last 50 looked-up words. Accessible from a Clock (`Clock`, Lucide) icon in the definition card.
- **Format support:** All formats (works on any rendered text)

---

#### Item 12: Settings (Reader)
- **Icon:** Settings (`Settings`, Lucide)
- **Label:** "Settings"
- **Feature:** Reader-specific settings (distinct from app settings in library)
- **Behavior (tap):** Opens settings bottom sheet or full panel.
- **Settings Content:**
  - **Brightness:** Slider (0%–100%), with auto-brightness toggle
  - **Haptic feedback on page turn:** Toggle (on/off)
  - **Overscroll effect:** Toggle (glow / none)
  - **Fullscreen mode:** Toggle (auto-hide all UI elements, show on tap/swipe)
  - **Screen timeout during reading:** 1 min / 5 min / 15 min / Never
  - **Font Size Quick Access:** (shortcut to Font & Theme — see Item 7)

---

## 3. Reading Screen — Full Specification

> This section covers the 9 core reader subsystems that were listed as pending in `docs/phase-3.md` Section 10. Each subsection is a standalone design spec with dimensions, tokens, states, and behaviors.

### 3.1 Full Screen Layout Specification

This is the overall screen chrome — how the reading area, system UI, and overlays relate to each other.

**Layout Structure (Normal Mode):**

```
┌──────────────────────────────────────────────┐
│  Status Bar (system, 24–48dp)                │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──┐                                        │
│  │M │    ┌──────────────────────────────┐    │
│  │E │    │                              │    │
│  │N │    │      READING CONTENT         │    │
│  │U │    │                              │    │
│  │  │    │      (EPUB or PDF)           │    │
│  │I │    │                              │    │
│  │U │    │                              │    │
│  │  │    │                              │    │
│  │U │    └──────────────────────────────┘    │
│  │S │                                        │
│  │  │                                        │
│  └──┘                                        │
│                                              │
├──────────────────────────────────────────────┤
│  Progress Indicator (2dp strip, always on)   │
├──────────────────────────────────────────────┤
│  Reading Toolbar (56dp, hidden by default)   │
├──────────────────────────────────────────────┤
│  System Nav Bar (gesture pill or 3-button)   │
└──────────────────────────────────────────────┘
```

**Layout Structure (Fullscreen / Immersive Mode):**

```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│         READING CONTENT (edge-to-edge)       │
│                                              │
│                                              │
│                                              │
│                                              │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

| Property | Normal Mode | Fullscreen Mode |
|----------|-------------|-----------------|
| **Status Bar** | Visible, transparent bg, blends with `bg-primary`. Status icons auto-switch light/dark | Hidden (immersive flag `SYSTEM_UI_FLAG_IMMERSIVE_STICKY`) |
| **System Nav Bar** | Visible (gesture pill or 3-button). Bottom inset respected | Hidden, reappears on swipe from edge, auto-hides after 2 seconds |
| **Rectangular Menu** | Visible (56dp collapsed or 220dp expanded) | Hidden — appears on tap-center or swipe from left edge |
| **Reading Toolbar** | Hidden by default, slides up on tap-center or swipe-up | Hidden by default, same trigger as Normal Mode |
| **Progress Indicator** | Always visible, 2dp strip at bottom of reading area | Hidden — only visible when toolbar is shown |
| **Reading Content Area** | Width = screen width − menu width (56dp or 220dp). Height = screen height − status bar − nav bar − progress strip. Content has internal padding: `margins` value from Font settings (8–48dp) | Width = full screen width. Height = full screen height. Content padding = same `margins` value. No chrome padding |
| **Safe Areas** | Top: status bar height. Bottom: nav bar height. Left: 0 (menu is the left edge). Right: 0 | All safe areas = 0 (edge-to-edge). Content is inset by `WindowInsets` only when chrome reappears |
| **Keep Screen On** | System default (auto timeout) | `FLAG_KEEP_SCREEN_ON` while reading in fullscreen — configurable in Settings overlay (timeout: 1 min / 5 min / 15 min / Never) |
| **Enter Fullscreen** | Toggle in Settings overlay (Item 12) or Reader Toolbar | Tap center or swipe-down-from-top to exit |
| **Exit Fullscreen** | — | Tap center, swipe-down-from-top, or back button |

**Content Inset Rules:**
- Reading content never extends under the Rectangular Menu. When menu expands, reading content shrinks (width recalculates). No overlap.
- Reading content never extends under the Reading Toolbar. When toolbar appears, it overlays the bottom of the reading content (no resize). Content remains scrollable behind it.
- Progress indicator (2dp strip) is always on top of reading content, at the very bottom edge of the reading area (above the toolbar layer).
- When keyboard appears (note input, search), reading content shrinks vertically (keyboard inset). Toolbar hides. Menu stays.

**Orientation Handling:**
- Portrait (default): single page/column, reading content fills width minus menu
- Landscape: optional two-column spread for EPUB (toggled in Font & Theme panel or Settings). If two-column is off, single column centered with wider margins. PDF in landscape: optional two-page spread (toggled in Settings)
- Auto-rotate: respects system setting unless user locks orientation in Font & Theme panel (Portrait / Landscape / Auto)

**Edge Cases:**
- Foldable inner display: menu + content layout recalculates on fold state change. No restart.
- Split-screen / freeform: reading content fills allocated window width. Menu always visible if window ≥ 360dp wide; hidden if narrower (accessible via hamburger).
- Very small screens (< 360dp): menu collapses to icon-only and may auto-hide (toolbar still accessible).

---

### 3.2 Reader Toolbar Design

The bottom toolbar is the quick-access control strip. It is the only persistent chrome that floats over the reading content.

**Container:**

| Property | Value |
|----------|-------|
| **Position** | Pinned to bottom edge of screen, above System Nav Bar inset |
| **Height** | 56dp |
| **Width** | Full screen width (edge-to-edge) |
| **Background** | `bg-card` (`#FFFFFF`) |
| **Border Radius** | `radius-lg` (16) on top-left and top-right only. Bottom edge is flush with screen/system nav |
| **Shadow** | `shadow-md` (4dp upward) — separates from reading content |
| **Z-Index** | Above reading content, below menu and above progress indicator |

**Content (left to right, horizontally centered, vertically centered):**

| # | Element | Width | Style | Behavior (tap) |
|---|---------|-------|-------|----------------|
| 1 | Page number — "42" | Wraps content | `font-title` (14sp Semi-Bold), `text-primary` | Opens Page Thumbnails panel (Section 3.5 / Item 8) |
| 2 | Separator dot | 4dp circle | `text-secondary`, centered vertically | None (visual separator) |
| 3 | Chapter name — "Chapter 3: The Beginning" | Fills center, truncate at ~20 chars | `font-caption` (11sp Regular), `text-secondary`, single line, ellipsis | Opens TOC panel (Section 3.6 / Item 1) |
| 4 | Bookmark toggle — Bookmark (`Bookmark`, Lucide) | 40dp × 40dp touch target, 20dp icon | `icon-tint` outline when not bookmarked, filled + `text-primary` when bookmarked. Filled uses `fill` prop | Toggles bookmark for current page. On toggle: scale 0.9 → 1.1 → 1.0 (150ms, spring), haptic tick (if enabled in Settings). Toast: "Bookmarked" / "Bookmark removed" at bottom-center, 2s |
| 5 | Highlight color dot — shows current selected highlight color | 20dp circle, `radius-full` | Background = current highlight color (one of 6). Border: 2dp `bg-card` + 1dp `divider` | Taps cycle through 6 colors in order (Yellow → Green → Blue → Pink → Orange → Purple → Yellow). On cycle: dot scales briefly, toast shows color name |
| 6 | Menu toggle — PanelLeft (`PanelLeft`, Lucide) | 40dp × 40dp touch target, 20dp icon | `icon-tint` | Expands/collapses the Rectangular Menu (Section 2) |

**Layout Spacing:**
- Between elements 1–3 (left group): `space-sm` (8) gap
- Between left group and center (bookmark): `space-lg` (16) gap via flex spacer
- Between center and right group (elements 4–6): `space-sm` (8) gap
- Horizontal padding inside toolbar: `space-lg` (16) left and right

**States & Animations:**

| State | Visual | Animation |
|-------|--------|-----------|
| **Hidden** | Toolbar translated 100% below screen (fully off-screen) | Slide down 250ms ease-in |
| **Visible** | Fully on-screen at bottom | Slide up 250ms ease-out |
| **Auto-hide** | After 3 seconds of no interaction (no tap, no scroll, no menu interaction), toolbar hides | Slide down 200ms ease-in. Timer resets on any touch. Menu interaction does NOT reset timer |
| **With TTS Active** | Toolbar extends upward by 64dp to include TTS mini-player (Section 3.9) stacked on top. Toolbar + mini-player form a single combined chrome with no gap | Mini-player slides up from toolbar top edge with 200ms ease-out |

**Empty / Edge States:**
- Unknown page number (e.g., reflowable EPUB without pagination): show "—" or percentage ("43%") instead of page number. Tapping still opens progress (Section 3.10)
- Unknown chapter: show book title truncated instead of chapter name. Tapping still opens TOC
- No highlights yet: highlight color dot still shows default (Yellow) — always tappable

---

### 3.3 Reading Mode Configurations (Scroll / Paginate / Fullscreen)

The reader supports three reading modes. The user selects a mode in the Theme/Font Controls panel (Section 3.8) and it applies immediately (live preview) across the current book. The mode persists per-book.

**Mode Comparison:**

| Aspect | Scroll Mode | Paginate Mode | Fullscreen Mode |
|--------|-------------|---------------|-----------------|
| **Layout** | Continuous vertical scroll. All content in one scrollable column | Discrete pages. One page per screen. Pages snap on swipe | Same as active base mode (Scroll or Paginate) but chrome is hidden (Section 3.1) |
| **Navigation** | Scroll thumb / fling / drag. No page-turn animation | Tap left/right edge or swipe left/right to turn page. Page-turn animation per transition setting | Same as base mode. Edge-tap zones expand to full height |
| **Content flow** | Reflowable (EPUB/TXT/MOBI): paragraphs flow continuously. PDF: pages stacked vertically with gap `space-lg` (16) between pages | Reflowable: content is paginated by measuring column height. Each "page" = one viewport height minus margins. PDF: one PDF page per screen | Same as base mode |
| **Scrollbar** | Native Android scrollbar (thin, `accent-track` color, auto-hides after 1s) | None — progress is via page indicator (Section 3.10) | None in fullscreen, same as base mode in non-fullscreen |
| **Page breaks** | None (continuous) | Virtual page breaks computed from font/size/spacing. "Page 42 of 312" is virtual. Recomputed when font/theme changes | Same as base mode |
| **Snap behavior** | None (free scroll) | Pages snap to viewport. Swipe velocity > threshold → next page. Otherwise snap back | Same as base mode |
| **Default for EPUB** | Yes (default) | Optional | Optional overlay mode |
| **Default for PDF** | Vertical stack of PDF pages | Yes (default — one PDF page per screen) | Optional overlay mode |

**Page Transition Animations (Paginate Mode Only):**

Selected in Font & Theme panel (Section 3.8, Section F):

| Transition | Visual | Duration | When to Use |
|------------|--------|----------|-------------|
| **Slide** | Current page slides left, next page slides in from right (or reverse for previous). Both pages visible during transition, 16dp gap | 300ms, ease-out + slight ease-in | Default. Clean, fast |
| **Fade** | Current page fades out (opacity 1→0), next page fades in (0→1). Overlap during transition | 250ms, ease-in-out | Minimal, calm |
| **Curl** | Page curl effect (current page peels away like a physical book page). Requires 3D transform. Only one page visible during curl | 400ms, ease-in-out with slight bounce at end | Skeuomorphic option |
| **None** | Instant switch — no animation. Pages snap | 0ms | Maximum speed, reduced motion |

**Mode Switch Behavior:**
- Switching from Scroll → Paginate: compute pagination, scroll position is converted to page number (`page = floor(scrollOffset / viewportHeight) + 1`). Animate to that page with None transition.
- Switching from Paginate → Scroll: `scrollOffset = (page - 1) * viewportHeight`. Smooth scroll to that offset.
- Switching either → Fullscreen: base mode is remembered, fullscreen flag toggles. Content does not reflow.
- Mode change is instant (no loading spinner). Pagination for long books (< 1000 pages) completes in < 200ms. For very long books (1000+ virtual pages), paginate lazily — only compute visible + 5 pages ahead, rest on demand.

**Fullscreen Detail:**
- Flag: `isFullscreen: boolean` (per-app, not per-book — toggling fullscreen applies to all books)
- Enter: triggered from Settings overlay (Item 12) toggle "Fullscreen Reading" or from Reading Mode selector in Font & Theme panel. Also accessible via double-tap on reading area (optional, configurable).
- Exit: tap center of screen, swipe-down-from-top, or press Back (first press exits fullscreen, second press exits reader and returns to library)
- While entering/exiting: chrome (menu, toolbar, progress indicator, status bar, nav bar) fades in/out together over 250ms while reading content scales slightly (98% → 100% on enter, reverse on exit)
- Keep-screen-on: `FLAG_KEEP_SCREEN_ON` while in fullscreen. Controlled by Settings overlay "Screen timeout during reading" (Section 3.7)

**PDF Dark Mode:**

> Reading themes (Section 3.8 Section D) recolor EPUB/TXT/MOBI text easily because the text is reflowable. PDFs are fixed-layout rendered bitmaps — they need separate handling.

| Property | MVP (Option A — Simple Invert) | Future Upgrade (Option B — Smart Invert) | Future Upgrade (Option C — Re-render) |
|----------|-------------------------------|------------------------------------------|---------------------------------------|
| **Status** | **Ship in MVP** — `phase-0.md` scope | Documented here, build when users request. Unblocks if photos look bad | Documented here, only if B is still not enough. Very heavy |
| **Method** | GPU filter on the PDF render layer: `invert(1) hue-rotate(180deg)` applied to the `PdfView` bitmap. One shader, no re-parse | A + extra pass: detect image rectangles per page (via PDF content stream `Image XObject` bounds), re-invert those rects back to original so photos stay correct while text stays light-on-dark | Re-parse PDF content stream, replace page background with dark color and text color with light color, re-layout. Per-page content rebuild |
| **Image handling** | Photos/charts invert together with text (negative). Acceptable for text-heavy PDFs (novels, scripture, textbooks with few images) | Photos/charts stay correct. Text/background remain inverted. Best visual result | Perfect — native dark rendering, images untouched, text correctly colored |
| **Perf cost** | Negligible — single GPU shader, no extra parse, no extra memory per page. Same FPS as normal PDF | Medium — image-rect detection per page (once, cached), extra draw pass per frame to composite re-inverted images | Heavy — parse + color substitution + layout per page. Slower open time, higher memory for large PDFs |
| **Toggle** | Settings overlay (3.7) row: "Dark mode for PDFs" — `Switch` (off by default for MVP). When on: `Moon` (`Moon`, Lucide, 16dp) hint below: "Images may appear inverted. Turn off if photos look wrong." — `font-caption` `text-secondary` | Same toggle, hint changes to "Photos stay correct." No extra toggle needed — B transparently replaces A | Same |
| **When active** | Applies only when a dark theme is selected (Dark / Warm Dark / Midnight / Custom dark bg). If Light/Sepia theme is active, PDF renders normally regardless of this toggle | Same | Same |
| **Renderer integration** | `PdfView` gets `colorFilter: { invert: isDarkTheme && isPdfDarkModeEnabled }`. Filter applied at view level, not per-page bitmap. Undo on theme switch is instant (filter removed, no reload) | Same outer filter + `ImageLayer` composited with `invert(1)` on image rects. Image rects cached in `page.imageRects: Rect[]` on first parse | Page background drawn as dark rect before content, text operators emitted with light color. Requires PDF library that exposes content stream (e.g., PDFium custom draw) |
| **Upgrade path** | — | When building B: keep the same toggle + setting key (`pdfDarkMode`). Internally branch: if `page.imageRects` is available, use B path; else fall back to A. No user-facing migration | When building C: add segmented control under the toggle — "Simple" / "Smart" / "Native" — persists as `pdfDarkModeQuality: 'simple' | 'smart' | 'native'` |

> **Implementation note for phase-4.md:** The PDF view component should be wrapped so the dark filter is a prop, not baked into the bitmap cache. This makes the A→B→C upgrade a view-layer change with no storage migration.

---

### 3.4 Annotation UI (Highlight Menu, Note Input, Bookmark Button)

This is the inline annotation interface — the controls that appear directly over or adjacent to reading content, distinct from the menu panels.

#### 3.4.1 Text Selection

| Property | Value |
|----------|-------|
| **Trigger** | Long-press on any word in reading content |
| **Selection handles** | Android native text selection handles (teardrop shapes). Color: `text-primary` (`#2C2C2E`). Handle size: system default |
| **Selection highlight** | Background: `text-primary` at 15% opacity (subtle grey highlight distinct from saved highlights). Selected text color: `text-primary` |
| **Handles drag** | Drag left/right handle to expand/shrink selection. Selection snaps to word boundaries by default. Double-tap a word to select just that word. Triple-tap to select paragraph (EPUB/TXT/MOBI only) |
| **Selection persistence** | Selection persists until user taps outside, presses back, or triggers an action (copy/highlight/note/dictionary). Tapping outside clears selection |
| **PDF selection** | Uses PDF rendering engine's text layer. If PDF is scanned/image-only (no text layer), selection is disabled and a "No selectable text" toast appears |

#### 3.4.2 Selection Toolbar (Context Menu)

Appears immediately when text is selected. Positioned above or below the selection, whichever has more space on screen (auto-flip).

| Property | Value |
|----------|-------|
| **Container** | Pill-shaped bar, `radius-full`, `bg-card-dark` (`#1C1C1E`), `shadow-lg` |
| **Height** | 48dp |
| **Width** | Wraps content, max screen width − 32dp. Horizontally centered relative to selection |
| **Position** | Above selection if ≥ 64dp space above, otherwise below. 8dp gap from selection bounds. If selection spans multiple lines, toolbar centers on screen width |
| **Animation** | Scale 0.8 → 1.0 + opacity 0 → 1, 150ms spring. Dismiss: reverse 120ms |
| **Dismiss** | Tapping outside selection, pressing back, or completing an action (highlight/note/copy) auto-dismisses both selection and toolbar |

**Toolbar Buttons (left to right, 40dp each, 20dp Lucide icons, `text-inverse` color):**

| Button | Icon (Lucide) | Label | Action |
|--------|---------------|-------|--------|
| Copy | `Copy` | "Copy" | Copies selected text to clipboard. Toast: "Copied". Selection cleared |
| Highlight | `Highlighter` | Color dots (6) | Tapping shows inline color picker row (see below). Does NOT dismiss toolbar until color chosen |
| Note | `Pencil` | "Note" | Opens Note Input Sheet (Section 3.4.4). Selection is preserved as note anchor |
| Dictionary | `Languages` | "Define" | Looks up selected word (if single word) or first word. Opens Dictionary Card (Item 11). Selection cleared after lookup |
| Share | `Share2` | "Share" | Opens native Android share sheet with selected text + book attribution |

**Overflow:**
- If toolbar cannot fit all 5 buttons (narrow screen or very short selection near edge), show first 4 + `MoreHorizontal` (`MoreHorizontal`, Lucide) overflow. Tapping overflow expands to show remaining buttons in a second row or popup.

#### 3.4.3 Highlight Color Picker

Appears inline when user taps the Highlight button in the selection toolbar, or when editing an existing highlight.

| Property | Value |
|----------|-------|
| **Position** | Replaces the 5 toolbar buttons — toolbar content changes to show 6 color circles. Same container (pill shape, `bg-card-dark`) |
| **Content** | Row of 6 circles, each 32dp diameter, `radius-full`, `space-sm` (8) gap. Colors: Yellow `#FFEB3B`, Green `#4CAF50`, Blue `#2196F3`, Pink `#E91E63`, Orange `#FF9800`, Purple `#9C27B0` |
| **Selection indicator** | Selected color: 2dp white border + checkmark (`Check`, Lucide, 14dp, white) centered inside. Unselected: no border, solid color fill |
| **Default selection** | Yellow pre-selected |
| **Action** | Tap any color → selected text is highlighted in that color (background at 85% opacity, original text color preserved). Toolbar + picker dismiss, selection cleared, highlighted text remains visible. Highlight is saved (visible in Highlights panel — Item 3) |
| **Cancel** | Tap outside picker or press back → picker dismisses back to toolbar buttons. No highlight applied |
| **Editing existing highlight** | Long-press an already-highlighted passage → toolbar appears with extra option "Change color" → tapping it shows same 6-color picker with current color pre-selected. Also shows `Trash2` (`Trash2`, Lucide) "Remove" button at end of color row |

**Highlight Rendering After Save:**

| State | Visual |
|-------|--------|
| **Normal** | Selected text has background = highlight color at 85% opacity, text color = `text-primary` (unchanged) |
| **Tapped highlight** | Background brightens to 100% opacity for 300ms, then returns to 85%. Shows mini toolbar (Copy, Change color, Remove, Add note) — same `bg-card-dark` pill, 48dp height, positioned above/below highlight |
| **Overlapping highlights** | Later highlight covers earlier (z-index = creation order). No blending |
| **In dark themes** | Background opacity reduces to 60% to preserve text readability against dark background. Text color remains `text-inverse` |

#### 3.4.4 Note Input Sheet

Appears when user taps "Note" in the selection toolbar, or taps the Note/Pencil icon in the reading toolbar to add a note for the current page, or creates a new note from the Notes panel FAB.

| Property | Value |
|----------|-------|
| **Container** | Bottom sheet, `bg-card` (`#FFFFFF`), `radius-lg` (16) top corners only, `shadow-lg` |
| **Height** | 40% of screen when keyboard hidden, grows to 60% when keyboard appears. Draggable to expand to 80% |
| **Drag handle** | Centered 32dp × 4dp pill at top, `divider` color (`#D9D4CC`), indicates sheet is draggable |
| **Z-Index** | Above reading content and toolbar, below menu |
| **Animation** | Slides up from bottom, 300ms spring. Dismiss: slides down 250ms. Keyboard appearance uses native keyboard animation (no custom) |

**Sheet Content (top to bottom):**

| Element | Layout | Style |
|---------|--------|-------|
| Header row | Horizontal, space-between | Left: "Add Note" (`font-heading`, `text-primary`). Right: close `X` (`X`, Lucide, 24dp, `icon-tint`) |
| Anchor snippet | Card, `bg-primary` (`#F0EDE6`), `radius-md` (12), internal padding `space-md` (12) | The selected/highlighted text shown as quoted anchor: `font-body`, `text-secondary`, italic, 2 lines max with ellipsis. If note is for whole page (no selection): "Page 42" — `font-caption` |
| Highlight color indicator | Row, 6 color dots (32dp each) if note is attached to a highlight | Same as Highlight Color Picker but smaller (24dp dots). Tapping changes the highlight color. If note is standalone (no highlight), this row is hidden |
| Note input field | Multiline text input, `bg-search` (`#E8E4DC`), `radius-md` (12), min height 80dp, max 200dp (scrollable beyond) | Placeholder: "Type your note..." — `font-body`, `text-secondary` at 60% opacity. Input text: `font-body`, `text-primary`. Cursor: `text-primary`. No character limit |
| Action row | Horizontal, flex-end | "Cancel" — text button, `font-title`, `text-secondary`. "Save" — pill button, `button-primary-bg`, `button-primary-text`, `radius-full`, height 40dp. `space-md` gap between |
| Meta row (when editing existing note) | Horizontal | Date created: `font-caption`, `text-secondary` on left. `Trash2` delete icon (`Trash2`, Lucide, 20dp, `icon-tint`) on right |

**Behaviors:**
- Save: creates/updates note, associates with highlight if one exists, shows in Notes panel (Item 4). Sheet dismisses, keyboard hides, toast: "Note saved"
- Cancel / close / swipe-down: dismisses sheet. If text was entered, shows "Discard note?" confirmation (Cancel / Discard buttons)
- Swipe-down-to-dismiss: drag sheet downward. If drag > 40% of sheet height, dismiss. Otherwise spring back
- Keyboard: when input is focused, sheet grows to accommodate keyboard. Sheet height animates with keyboard via `react-native-keyboard-controller` or equivalent

**Note Display After Save:**
- In reading content: note indicator — small `Pencil` icon (`Pencil`, Lucide, 12dp, highlight color) in the right margin aligned with the anchored text. Tap indicator → reopens Note Input Sheet for that note. In dark themes, indicator is white at 60% opacity

#### 3.4.5 Bookmark Button (Inline)

| Property | Value |
|----------|-------|
| **Position (reading content)** | Top-right of reading area, 16dp below status bar inset, 16dp from right edge (outside the text column but inside the reading area) |
| **Size** | 40dp × 40dp touch target, 20dp icon |
| **Icon** | Bookmark (`Bookmark`, Lucide). Outline (stroke only) = not bookmarked. Filled (with `fill` prop, same shape) = bookmarked |
| **Color** | `icon-tint` (`#8B8680`) when not bookmarked, `text-primary` (`#2C2C2E`) when bookmarked. In dark reading themes: `text-inverse` when bookmarked |
| **Background** | None (transparent) when not bookmarked. No background circle. Subtle `bg-card-dark` at 10% opacity behind filled state only |
| **Show/hide** | Visible when reading toolbar is visible. Hidden when toolbar is hidden (auto-hide sync). When reading toolbar is hidden but user scrolls to top/bottom edge, bookmark button peeks with 40% opacity as a hint (tappable even when peeking) |
| **Action (tap)** | Toggles bookmark for current page/position. No panel opens — just the button state flips. Haptic tick. Toast at bottom-center: "Bookmarked" / "Bookmark removed", 2s, `bg-card-dark` pill |
| **Animation** | Scale 0.8 → 1.2 → 1.0 (200ms spring) on toggle. Filled state animates in with 100ms scale-up |
| **Double-state** | This is the same bookmark as the Bookmarks panel (Item 2) — toggling here updates the panel list immediately |

---

### 3.5 TOC Panel Design (Table of Contents)

Accessed via Menu Item 1 (BookOpen) or by tapping the chapter name in the Reading Toolbar (Section 3.2).

| Property | Value |
|----------|-------|
| **Type** | Side panel (slides in from left, over the Rectangular Menu) |
| **Width** | 300dp |
| **Height** | Full screen (minus status bar) |
| **Background** | `bg-card` (`#FFFFFF`) |
| **Border Radius** | `radius-lg` (16) top-right and bottom-right only |
| **Shadow** | `shadow-lg` on right edge |
| **Animation** | Slides in from left (translateX: −300 → 0) over 300ms ease-out. Dismiss: reverse 250ms. Dim overlay behind panel (`bg-overlay` 40% black on reading content) fades in/out with same timing |
| **Dismiss** | Tap close `X` (`X`, Lucide, 24dp, `icon-tint`) at top-right, tap on dim overlay, swipe left on panel, or press Back |

**Panel Content (top to bottom):**

| Element | Layout | Style |
|---------|--------|-------|
| Header | Horizontal, space-between, height 56dp, padding `space-lg` (16) horizontal | Title: "Table of Contents" — `font-heading` (18sp Semi-Bold), `text-primary`. Right: `X` close button |
| Book info row | Horizontal, `space-md` (12) gap, padding `space-lg` | Cover thumbnail 40×55dp `radius-sm`, book title `font-title` `text-primary`, author `font-caption` `text-secondary`, truncated at 1 line each |
| Search field | Rounded rect, `bg-search` (`#E8E4DC`), `radius-full`, height 40dp, margins `space-lg` horizontal | Placeholder: "Find chapter..." — `font-body`, `text-secondary`. Left: `Search` icon. Filters list in real-time (debounced 200ms). When filtering, non-matching chapters at 40% opacity |
| Chapter list | Vertical scroll, padding `space-md` (12) | See below |
| Footer stats | Horizontal, `space-md` gap, padding `space-lg`, `divider` top border | "18 chapters · 312 pages" — `font-caption`, `text-secondary`, centered |

**Chapter List Item:**

```
┌────────────────────────────────────────┐
│  #   Chapter Title             Page  ▶ │
│  03  The First Journey          p. 42 │
└────────────────────────────────────────┘
```

| Part | Style | Notes |
|------|-------|-------|
| Chapter number | `font-caption` (11sp), `text-secondary`, min-width 28dp, right-aligned | "03" or roman "III" for front matter. User preference in settings: show/hide numbers |
| Title | `font-body` (13sp) for unselected, `font-title` (14sp Semi-Bold) for current chapter. `text-primary` for current, `text-secondary` for others. Fills available width, 2 lines max | Hierarchy indentation: Part titles (H1) no indent, Chapter titles (H2) indent `space-md` (12), Section titles (H3) indent `space-lg` (16) + smaller font (`font-caption`) |
| Page number | `font-caption`, `text-secondary`, right-aligned | "p. 42" format. In paginate mode: virtual page. In scroll mode: approximate page from scroll offset |
| Disclosure chevron | `ChevronRight` (Lucide, 16dp, `icon-tint`) | Only if chapter has subsections that can expand/collapse |

**Current Chapter State:**

| Visual | Value |
|--------|-------|
| Left accent | 4dp solid bar, `text-primary` (`#2C2C2E`), full item height, `radius-sm` right edge only |
| Background | `bg-primary` (`#F0EDE6`), `radius-md` |
| Title weight | Semi-Bold (600) instead of Regular |
| Page number | `text-primary` instead of `text-secondary` |

**Hierarchy Example (nested):**

```
PART I — Beginnings
   01  Prologue ................ p. 1
   02  The First Light ......... p. 8
      2.1  Dawn ................ p. 12
      2.2  Noon ................ p. 18
   03  The Journey ............. p. 24
PART II — Middle
   ...
```

- Part titles: `font-title` (14sp Semi-Bold), `text-primary`, `space-lg` top margin, all caps, `tracking` letter-spacing 0.5sp
- Tap hierarchy disclosure chevron: expands/collapses children with 150ms height animation

**Scroll Sync:**
- TOC auto-scrolls so current chapter is centered vertically on open
- While reading, if user navigates to a new chapter (scroll or paginate), TOC current indicator updates live (left accent moves with 200ms transition)

**Empty / Edge States:**
- No TOC available (TXT without chapters, PDF without bookmarks): header still shown but with "No table of contents" center message + "Page list" alternative showing page numbers as list items

---

### 3.6 Settings Overlay Design

Accessed via Menu Item 12 (Settings) or gear icon in profile navigation. Distinct from Font & Theme panel (Section 3.8) — Settings handles system/app behavior, not visual reading appearance.

| Property | Value |
|----------|-------|
| **Type** | Bottom sheet |
| **Height** | 70% of screen, draggable to 90% full |
| **Background** | `bg-card` (`#FFFFFF`) |
| **Border Radius** | `radius-lg` (16) top-left and top-right only |
| **Shadow** | `shadow-lg` top edge |
| **Drag handle** | 32×4dp pill at top, `divider` color, centered |
| **Animation** | Slides up from bottom, 300ms spring. Dismiss: slides down 250ms. Dim overlay behind (40% black) |
| **Dismiss** | Drag down > 40% height, tap dim overlay, `X` at top-right, or Back |

**Sheet Content (vertical sections, top to bottom):**

| Section | Header | Controls |
|---------|--------|----------|
| Display | `font-title`, `text-primary` — "Display" | **Brightness:** slider 0–100%, `accent-progress` fill, `accent-track` track, `Sun` (`Sun`, Lucide) left + `Moon` (`Moon`, Lucide) right icons for range. Below: "Auto-brightness" toggle (`Switch` component: track `divider` off / `text-primary` on, thumb white). **Auto-dim schedule:** if auto-brightness on, shows time picker "Dim after sunset" toggle |
| Reading Experience | "Reading" | **Haptic feedback on page turn:** toggle (on/off). **Overscroll effect:** segmented control — Glow / None. **Page turn sound:** toggle (on/off, shows volume slider when on). **Double-tap to fullscreen:** toggle |
| Screen | "Screen" | **Keep screen on during reading:** segmented control — 1 min / 5 min / 15 min / Never. **Orientation lock:** segmented — Auto / Portrait / Landscape (mirrors Font panel's control — synced). **Fullscreen reading:** toggle — when on, entering reader immediately goes fullscreen |
| Gestures | "Gestures" | **Tap zones:** segmented — Edges only / Full width / Disabled (controls whether tap left/right edge turns page). **Swipe to turn page:** toggle. **Long-press to select:** toggle. Info text `font-caption` `text-secondary`: "Gestures can be adjusted. Conflicts are resolved by priority: selection > page turn > toolbar" |
| Data | "Data" | **Font Size Quick Access:** shortcut row — "Go to Font Settings" → navigates to Font & Theme panel (Section 3.8). Row has `Type` icon left, title, `ChevronRight` right |

**Section Separator:** `divider` (`#D9D4CC`) 1dp horizontal line, `space-lg` margin top and bottom, no line after last section

**Footer:** Version / build info: `font-caption`, `text-secondary`, centered at very bottom, 32dp padding. No action needed

**Control Tokens (reused):**

| Control | Visual Spec |
|---------|-------------|
| Slider | Track height 4dp, `radius-full`, `accent-track` / `accent-progress`. Thumb 20dp circle, `bg-card-dark` with 2dp white border, `shadow-sm`. Min/max label `font-caption` at each end |
| Toggle (Switch) | Track 40×24dp `radius-full`, thumb 20dp circle. Off: track `divider`, thumb white at left. On: track `text-primary`, thumb white at right. Animate 150ms ease-in-out |
| Segmented Control | Pill background `bg-search`, `radius-full`, height 36dp. Segments: text `font-body` 13sp, `text-secondary` unselected, `text-inverse` selected. Selected segment: `bg-card-dark` pill `radius-full`. Sliding indicator 200ms |

---

### 3.7 TOC / Settings Interaction Notes

- TOC panel and Settings sheet are mutually exclusive — opening one dismisses the other if both would be on screen
- Both overlay the Rectangular Menu (z-index: Settings/TOC > Menu > Reading Content)
- Both remember scroll position: reopening restores previous scroll offset

---

### 3.8 Theme / Font Controls Panel

> This is the full visual customization panel. It is the primary way users personalize the reading experience and must feel immediate and playful (live preview as they adjust).

Accessed via Menu Item 7 (Type) or via Settings overlay shortcut "Go to Font Settings" or long-press on reading content → Font shortcut.

| Property | Value |
|----------|-------|
| **Type** | Side panel (slides in from left, 300dp wide) on tablets / wide screens. Bottom sheet (60% height, draggable to 80%) on phones (< 600dp). Decision: `useWindowDimensions().width >= 600 ? side panel : bottom sheet` |
| **Background** | `bg-card` (`#FFFFFF`) |
| **Border Radius** | `radius-lg` (16) on side facing reading content |
| **Shadow** | `shadow-lg` |
| **Animation** | Same as TOC panel (slide from left 300ms, or slide up from bottom 300ms spring) |
| **Dismiss** | Close `X`, dim overlay tap, swipe (left or down), or Back. Also explicit "Done" pill button at bottom |
| **Live Preview** | Every change applies instantly to reading content behind the panel (reading content remains partially visible behind dim overlay at 30% opacity so user sees effect). Reset is per-control or via "Reset All" at bottom |

**Panel Content (sections top to bottom, vertical scroll):**

**Section A — Font Family:**

| Label | "Font Family" — `font-title` (14sp Semi-Bold), `text-primary` |
|-------|---------------------------------------------------------------|
| Layout | Vertical list of radio options |
| Options | 1. **System Default** — uses device font. 2. **Serif** — Georgia / Noto Serif. 3. **Sans-Serif** — Roboto / system sans. 4. **Monospace** — Courier / monospace. 5. **Dyslexia-Friendly** — OpenDyslexic (requires download — shows `Download` (`Download`, Lucide) button if not installed, installs via bundled font asset) |
| Selection | Selected row: `bg-primary` background `radius-md`, `Check` (`Check`, Lucide, 16dp, `text-primary`) at right. Unselected: transparent bg, no check. Preview: font sample "Ag" in actual font at 18sp to the right of name, before the check |
| Hint | Under Dyslexia row: `font-caption` `text-secondary` — "Designed for easier reading. May require download." |

**Section B — Text Size:**

| Label | "Size" — `font-title` + current value "16sp" (`font-body` `text-secondary`) on same row, space-between |
|-------|---------------------------------------------------------------------------------------------------------|
| Control | Slider range 12sp–48sp, default 16sp. Minus (`Minus`, Lucide, 20dp) button on left, Plus (`Plus`, Lucide) on right. Slider in center. Track: `accent-track`/`accent-progress` |
| Preview | Sample paragraph below slider in selected font+size: `font-body` with full rendering — shows 2 lines "The quick brown fox jumps over the lazy dog" updating live |
| Steps | Slider snaps to 1sp increments. Minus/Plus buttons step by 1sp with haptic tick |

**Section C — Spacing:**

| Label | "Spacing" — `font-title` |
|-------|---------------------------|
| Line Spacing | Row: label "Line height" `font-caption` left, value "1.5" `font-caption` `text-secondary` right, slider 1.0–3.0 step 0.1 below |
| Paragraph Spacing | Row: label "Paragraph gap" left, value "12dp" right, slider 0–24dp step 2dp |
| Margins | Row: label "Margins" left, value "24dp" right, slider 8–48dp per side. Visual: small preview rectangle with margin guides rendered below slider (mini page with shaded margin areas that grow/shrink as slider moves) |

**Section D — Theme:**

| Label | "Theme" — `font-title` |
|-------|-------------------------|
| Layout | Grid of color swatches, 3 columns on phone (2 rows of 3), 6 on tablet (1 row). Gap `space-md` (12) |
| Swatches | Each: 80×60dp rectangle `radius-md` (12), `shadow-xs`, centered label below. Options (6 swatches): |
| | • **Light** — bg `#FFFFFF`, text `#2C2C2E` — border `divider` 1dp (to show edge on white). Label "Light" `font-caption` |
| | • **Sepia** — bg `#F0EDE6`, text `#2C2C2E` — default. Label "Sepia" |
| | • **Dark** — bg `#1C1C1E`, text `#FFFFFF`. Label "Dark" (neutral dark) |
| | • **Warm Dark** — bg `#1E1814`, text `#E8DCC8` — warm/sepia at night, matches app warm identity. Label "Warm" |
| | • **Midnight** — bg `#1A1A2E`, text `#E0E0E0`. Label "Midnight" (cold blue dark) |
| | • **Custom** — bg `+` icon (`Plus`, Lucide, 24dp, `text-secondary`) centered, border dashed `divider` 1dp. Label "Custom". Tap opens color pickers (see below) |
| Selection | Selected swatch: 2dp `text-primary` border, slight scale 1.04, `shadow-sm`. Unselected: no border |
| Custom Pickers | When Custom tapped: two color pickers appear below swatch grid: "Background" and "Text" — each is a row of 8 preset color dots (24dp circles) + hue slider + hex input field `font-caption`. Presets provide quick choices; slider+hex for precision. Live preview behind panel updates as colors change |
| Scope | This panel recolors **only the reading content area** (book text/background inside the reading viewport). It does **not** recolor the Rectangular Menu, Reading Toolbar, Progress Strip, or any app chrome — those stay `bg-card-dark` / `bg-card` per `phase-3.md` Section 2.1 regardless of reading theme. The Library's app theme (`phase-3.md` Section 8) is independent. Selection persists **per-book** (each book remembers its own theme), not globally |

**Section E — Orientation:**

| Label | "Orientation" — `font-title` |
|-------|-------------------------------|
| Control | Segmented control (see Section 3.6 tokens), 3 segments: Auto-Rotate / Portrait / Landscape |
| Note | Below: `font-caption` `text-secondary` — "Locked orientation applies only while reading this book." |

**Section F — Page Transition:**

| Label | "Page Turn" — `font-title` |
|-------|-----------------------------|
| Control | Segmented control, 4 segments: Slide / Fade / Curl / None (see Section 3.3 for animation specs) |
| Preview | Small animated card below control showing the selected transition: a 60×80dp page mock that animates the transition on loop (2s cycle) so user can see before confirming |

**Panel Footer (sticky, not scrolled):**

| Element | Style |
|---------|-------|
| Reset All | Text button, "Reset to defaults" — `font-body` `text-secondary`, centered, `space-lg` padding. Tap shows "Reset everything?" confirmation (Cancel / Reset) |
| Done | Pill button, "Done" — `button-primary-bg` `button-primary-text` `radius-full` height 44dp, full width minus `space-xl` horizontal margin. Closes panel |

---

### 3.9 TTS / Read Aloud Controls

> TTS converts book text to speech using the Android system TTS engine (or bundled voice if available). This section specifies every control the user sees and hears.

**Entry Point:** Menu Item 5 (Volume2). Tapping toggles TTS on/off. When `isTTSActive` becomes true, the mini-player appears and speech begins from the current reading position (top of currently visible content).

**Mini-Player (Collapsed / Persistent):**

| Property | Value |
|----------|-------|
| **Position** | Stacked directly on top of the Reading Toolbar (Section 3.2) — forms a combined chrome. Toolbar + mini-player have no gap; shared `bg-card` background; single `shadow-md` around the combined block |
| **Height** | 64dp |
| **Width** | Full screen width |
| **Background** | `bg-card` (`#FFFFFF`) |
| **Shadow** | Part of combined toolbar shadow — no separate shadow |
| **Separator** | 1dp `divider` line between mini-player and toolbar beneath it |
| **Animation** | Slides up from toolbar top edge with 200ms ease-out when TTS activates. Slides down 200ms when dismissed |

**Mini-Player Content (left to right):**

| # | Element | Size | Style | Behavior |
|---|---------|------|-------|----------|
| 1 | Play/Pause | 40dp circle, 20dp icon inside | `bg-card-dark` circle, icon `text-inverse` white. `Play` (Lucide) when paused, `Pause` when playing | Toggle play/pause. Haptic tick. Icon morphs 120ms |
| 2 | Chapter/Page label | Wraps content, max 100dp | `font-body` (13sp) `text-primary` — "Ch. 3" or "p. 42". Truncate | Tap opens TOC (scrolls to current chapter) |
| 3 | Progress scrubber | Fills center, height 32dp hit target, visual bar 4dp | Track `accent-track` `radius-full`, fill `text-primary` `radius-full`. Draggable thumb (hidden until drag, then 16dp white circle appears) | Drag to seek within current chapter. Fill grows from 0→100% over chapter duration. On drag: thumb appears, haptic tick on snap to sentence boundaries |
| 4 | Speed control | 36dp circle touch target, label inside | `font-caption` `text-secondary`, "1x". When tapped: cycles 0.5x → 0.75x → 1x → 1.25x → 1.5x → 2x → 3x → 0.5x (wrap). Each speed: toast "<speed> speed" | Change playback rate. Affects speech immediately. Rate persists |
| 5 | Skip back | 36dp circle, 18dp icon | Icon `SkipBack` (Lucide), `icon-tint` | Jump back 10 seconds (rewind). Haptic tick. If at chapter start, jump to previous chapter end |
| 6 | Skip forward | 36dp circle, 18dp icon | Icon `SkipForward` (Lucide), `icon-tint` | Jump forward 10 seconds. At chapter end: next chapter start |
| 7 | Dismiss | 36dp circle, 18dp icon at far right | Icon `X` (Lucide), `icon-tint` | Stop TTS and dismiss mini-player. Reading content highlight (if any) cleared |

**Highlight Spoken Word (optional sync):**

When enabled (Settings in Item 5 / TTS Settings overlay):
- The currently spoken sentence is highlighted in reading content with a Yellow `#FFEB3B` background at 60% opacity (lighter than saved highlights so it's distinguishable). Highlight scrolls with speech.
- The spoken word within the sentence is underlined with 2dp `text-primary` underline (animated — moves word to word).
- Reading content auto-scrolls so spoken sentence stays in middle third of viewport (smooth scroll 300ms, not jump).
- When TTS reaches end of visible page in paginate mode: page turns automatically with selected transition (Section 3.3) after 500ms pause at page boundary.

**Expanded Player (Full Controls — optional):**

Tap the progress scrubber label or swipe up on mini-player to expand.

| Property | Value |
|----------|-------|
| **Type** | Bottom sheet overlay, 50% screen height, draggable to 70% |
| **Background** | `bg-card` (`#FFFFFF`), `radius-lg` top corners, `shadow-lg` |
| **Content** | Larger scrubber (8dp bar, thumb always visible 20dp), play/pause 56dp circle centered, skip buttons 48dp each left/right of play/pause, speed selector as horizontal segmented control (not cycle), voice picker (dropdown of installed TTS voices), sleep timer section, highlight-sync toggle. Full transcript of current chapter with current sentence bold+highlighted |
| **Dismiss** | Swipe down, tap dim overlay, or `X` top-right |

**Sleep Timer:**

Accessed from TTS Settings (Item 5) or expanded player.

| Option | Behavior |
|--------|----------|
| **Off** | No timer — TTS plays until chapter/book end or user stops. Default |
| **End of chapter** | TTS stops with fade-out (1s) when current chapter ends |
| **15 / 30 / 60 minutes** | Countdown from activation. When timer expires: fade-out over 3s then stop. Toast: "Sleep timer ended" |
| **Custom** | Time picker (number input) 1–180 minutes |

All timers show countdown in the expanded player scrubber area: "Sleep in 14:32" — `font-caption` `text-secondary`

**TTS Settings Panel (from Item 5):**

| Control | Style |
|---------|-------|
| Voice selection | Dropdown / list of system voices grouped by language. Shows voice name, language, gender if known. Tap to select. Preview: "Hello" spoken in selected voice on tap |
| Highlight spoken word | Toggle (see Section 3.6 tokens) — on = sentence highlight + word underline + auto-scroll |
| Background playback | Toggle — if on, TTS continues when app is backgrounded (requires foreground service + notification). Notification shows: book title, chapter, play/pause, skip, dismiss. If off, TTS pauses when app backgrounds + resumes when foregrounded |

**Format & Edge Handling:**

| Scenario | Behavior |
|----------|----------|
| EPUB / TXT / MOBI | Full sentence-level TTS via Android TTS engine reading the plain text. All controls fully functional |
| PDF | Limited: if PDF has text layer, same as EPUB. If scanned/image PDF (no text), TTS shows "No readable text on this page. Try another page." mini-player still shows but play button is disabled (40% opacity) with `VolumeX` (`VolumeX`, Lucide) mute icon |
| Chapter with no text (images only) | Skip to next textual chapter automatically with toast "Chapter has no text — skipping" |
| TTS engine unavailable | If Android TTS engine is missing/disabled, show install prompt: "Text-to-speech not available. Install system TTS engine?" → opens Play Store to Google TTS. Mini-player hidden until engine installed |
| Incoming call / audio focus loss | TTS pauses and ducks. Resume when call ends or focus returns. Uses `AudioManager` focus |
| Speech rate persistence | Selected rate saved per-device (not per-book) in local storage, survives app restart |

---

### 3.10 Progress / Position Indicator

The progress system shows where the user is in the book and how much reading remains. It has two layers: the always-visible strip and the detailed overlay.

#### 3.10.1 In-Reader Progress Strip (Always Visible)

| Property | Value |
|----------|-------|
| **Position** | Bottom edge of reading content area, just above the Reading Toolbar (Section 3.2) when toolbar is visible; at the very bottom edge (above System Nav Bar inset) when toolbar is hidden. 2dp tall, full width of reading content (screen width − menu width) |
| **Track** | `accent-track` (`#D9D4CC`) at full width, `radius-sm` (8) |
| **Fill** | `text-primary` (`#2C2C2E`) — advances from left to right. Width = `progressPercent * readingContentWidth`. `radius-sm` (8) on right edge of fill |
| **Behavior** | Fill width updates live as user scrolls or pages. No animation on scroll (follows finger). On paginate page turn: fills to new page's position with 200ms ease-out matching transition |
| **In dark reading themes** | Fill = `text-inverse` (`#FFFFFF`), track = `divider` at 40% opacity |
| **Fullscreen** | Hidden — only visible when toolbar is shown (Section 3.1) |

#### 3.10.2 Progress Scrubber (Interactive)

Appears when user long-presses or drags the progress strip, or taps the page number in the toolbar.

| Property | Value |
|----------|-------|
| **Activation** | Long-press (300ms) anywhere on the strip, or vertical swipe up from the strip. On activation, strip grows from 2dp to 32dp (height animation 150ms) |
| **Expanded strip** | Height 32dp, same track/fill colors, now contains: draggable thumb + page label + chapter ticks |
| **Thumb** | 16dp white circle with 2dp `text-primary` border, `shadow-sm`, centered vertically on the strip. Drag left/right to scrub. Haptic tick every page/chapter boundary while dragging. Position = touch X clamped to strip bounds |
| **Page label** | Above thumb, `bg-card-dark` pill `radius-full`, `font-caption` `text-inverse` white — "42 / 312" or "Ch. 3 · p. 42". Follows thumb with offset so it stays above finger. Background pill `space-sm` padding |
| **Chapter ticks** | Small vertical ticks (2dp wide, 8dp tall, `text-primary` at 30% opacity) spaced along the strip at each chapter start. Visual indicator of chapter boundaries without text |
| **Release** | On release: navigate to that page/chapter (page turn with None transition, scroll offset jump, or PDF page jump). Strip shrinks back to 2dp over 150ms. Thumb fades out |
| **Cancel** | Swipe away from strip vertically or press Back while expanded → cancel, strip shrinks, position reverts, no navigation |

#### 3.10.3 Progress Detail Overlay (Menu Item 9 — Expanded)

Accessed via Menu Item 9 (BarChart3) or by tapping the progress scrubber's page label when scrubber is not in expanded/dragging state.

| Property | Value |
|----------|-------|
| **Type** | Bottom sheet, 60% screen height, draggable to 80% |
| **Background** | `bg-card` (`#FFFFFF`), `radius-lg` top corners, `shadow-lg` |
| **Drag handle** | 32×4dp pill at top, `divider` color |
| **Animation** | Slides up 300ms spring, slides down 250ms on dismiss. Dim overlay 40% behind |
| **Dismiss** | Drag down > 40% height, tap dim overlay, `X` at top-right, or Back |

**Overlay Content (top to bottom):**

| Element | Layout | Style |
|---------|--------|-------|
| Header row | Horizontal, space-between, padding `space-lg` | Title: "Progress" — `font-heading` `text-primary`. Right: `X` close button |
| **Circular progress ring** | Centered, 140dp diameter | Ring track: `accent-track` 8dp thick. Ring fill: `text-primary` 8dp thick, advances clockwise from top-center. Center: "43%" — `font-stat-large` (28sp Bold) `text-primary`. Below: "134 of 312 pages" — `font-caption` `text-secondary`. Animation on entry: ring draws from 0→current in 600ms ease-out |
| **Details grid** | 2 columns, gap `space-md` (12), padding `space-lg` horizontal | 4 cells, each: `bg-primary` (`#F0EDE6`) `radius-md` padding `space-md`: |
| | | • "Pages Read" — count `font-stat-large` 20sp Bold `text-primary` "134 / 312" + label `font-caption` `text-secondary` |
| | | • "Time Spent" — "3h 24m" + label "Total" |
| | | • "Chapters Completed" — "7 / 18" |
| | | • "Days Reading" — "12 days" + streak indicator: `Flame` (`Flame`, Lucide, 14dp, Orange `#FF9800`) icon + "5 day streak" caption |
| **Reading Goal section** | Card, `bg-card-dark` (`#1C1C1E`) `radius-lg` padding `space-lg`, margin `space-lg` | Title: "Daily Goal" — `font-stat-label` `text-inverse`. Progress row: "25/30 min today" `font-body` `text-inverse-secondary` on left, flame-free. Bar: track `#3A3A3C`, fill `#FFFFFF` 4dp. `space-sm` gap. Below: `font-caption` `text-inverse-secondary` — "5 min to goal" or "Goal completed! 🎉" |
| **Estimated Time Remaining** | Row, centered, padding `space-xl` | `Clock` (`Clock`, Lucide, 16dp, `text-secondary`) + "6h 15m at current pace" — `font-body` `text-secondary`. Below small: `font-caption` — "Based on 38 min/day average" |
| **Reading History mini-graph** | Horizontal bar chart, height 48dp, `space-lg` margins | 7 bars for last 7 days, each bar: filled height = minutes read that day / goal. Filled `text-primary`, unfilled at 15% opacity. Today's bar highlighted with `text-primary` full. Below each bar: day label (M T W T F S S) `font-caption` `text-secondary`. Title above: "This Week" `font-caption` `text-secondary` |

**Empty / Early States:**
- Brand new book (0%): ring at 0, details show "0 / 312", streak "0 days", time "0h 0m", remaining "Calculating..."
- No reading history yet: mini-graph shows all bars at 0 with dashed outline
- Goal not set: goal section shows "Set a daily reading goal" `font-body` link that navigates to Reading Goals setup (same `bg-card-dark` card, progress bar hidden, button "Set Goal" pill)

---

## 4. Format Support Matrix

| Feature | EPUB | PDF | MOBI | TXT | DOCX |
|---------|------|-----|------|-----|------|
| **Open & Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Reflowable Text** | ✅ | ❌ | ✅ | ✅ | Partial |
| **Font/Theme Customization** | ✅ | ❌ | ✅ | ✅ | Partial |
| **Table of Contents** | ✅ | Bookmark-based | Partial | Manual | Partial |
| **Highlights** | ✅ | Overlay only | ✅ | ✅ | Partial |
| **Bookmarks** | ✅ | Page-based | ✅ | Page-based | Partial |
| **Notes** | ✅ | Annotations | ✅ | ✅ | Partial |
| **Search in Book** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Read Aloud (TTS)** | ✅ | Limited | ✅ | ✅ | ✅ |
| **Dictionary Tap** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Page Thumbnails** | Generated | Native | Generated | Numbered | Numbered |
| **Import from Device** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Copy Text** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Share** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Notes:**
- "Partial" = functionality available but limited compared to native format. For MVP, DOCX support can be deferred.
- "❌" = not applicable due to fixed layout nature of PDF (font/theme still applies to UI but not to PDF content itself)
- PDF highlights/annotations are overlay-based and saved as PDF comment annotations in the file

---

## 5. Menu State Reference

### 5.1 Collapsed State (Default When Idle)

```
┌─────────────┐
│  ← (toggle) │  ← ChevronLeft / ChevronRight (Lucide)
│             │
│  [BookOpen] │  ← Chapters (Lucide: BookOpen)
│             │
│  [Bookmark] │  ← Bookmarks (Lucide: Bookmark)
│             │
│  [Highlighter] │ ← Highlights (Lucide: Highlighter)
│             │
│  [Pencil]   │  ← Notes (Lucide: Pencil)
│             │
│  [Volume2]  │  ← TTS (Lucide: Volume2, active state shown)
│             │
│  [Search]   │  ← Search (Lucide: Search)
│             │
│  [Type]     │  ← Font & Theme (Lucide: Type)
│             │
│  [Rows3]    │  ← Pages (Lucide: Rows3)
│             │
│  [BarChart3]│  ← Progress (Lucide: BarChart3)
│             │
│  [Share2]   │  ← Share (Lucide: Share2)
│             │
│  [Languages]│  ← Dictionary (Lucide: Languages)
│             │
│  [Settings] │  ← Settings (Lucide: Settings)
│             │
└─────────────┘
```
- Width: 56dp
- Icons centered vertically with equal spacing (`space-lg`)
- Active items show circular highlight background (white on dark)

### 5.2 Expanded State

```
┌──────────────────────┐
│  ← (toggle)          │
│                      │
│  [BookOpen] Chapters       │
│                      │
│  [Bookmark] Bookmarks      │
│                      │
│  [Highlighter] Highlights      │
│                      │
│  [Pencil] Notes          │
│                      │
│  [Volume2] Read Aloud     │
│                      │
│  [Search] Search         │
│                      │
│  [Type] Font & Theme   │
│                      │
│  [Rows3] Pages          │
│                      │
│  [BarChart3] Progress       │
│                      │
│  [Share2] Share           │
│                      │
│  [Languages] Dictionary     │
│                      │
│  [Settings] Settings        │
│                      │
└──────────────────────┘
```
- Width: 220dp
- Icons left-aligned at 16dp from left edge
- Labels left-aligned at 48dp from left edge (aligned after icon)
- `space-md` (12) vertical gap between items
- Active items show left border indicator (4dp white line) + label weight change

### 5.3 Transition States
- **Expanding:** Menu slides right from 56dp → 220dp. Items fade in from opacity 0 → 1 with 50ms stagger. Labels slide in from left with 150ms offset. Total animation: 250ms.
- **Collapsing:** Reverse. Labels fade out first, then menu slides back. Total animation: 200ms.

---

## 6. Gesture Map (Reading Screen)

> All gestures in one place. Priority order when gestures conflict: Text Selection (3.4.1) > Page Turn (3.3) > Toolbar Toggle (3.2) > Menu Expand/Collapse (2.2). When a gesture could mean two things, the higher-priority handler wins.

| # | Gesture | Context / Condition | Action | Section |
|---|---------|---------------------|--------|---------|
| 1 | Tap left edge (outer 10% of reading area) | No text selection active | Previous page (paginate) or previous paragraph (scroll) | 3.3 |
| 2 | Tap right edge (outer 10%) | No selection | Next page / next paragraph | 3.3 |
| 3 | Tap center (middle 80%) | No selection | Toggle Reading Toolbar (3.2) visibility (show if hidden, hide if visible). If in fullscreen (3.1): also toggles menu visibility | 3.1, 3.2 |
| 4 | Tap highlight | Highlight exists at tap point | Brighten highlight (3.4.3) + show mini toolbar (Copy / Change color / Remove / Note) | 3.4.3 |
| 5 | Tap note indicator | Note exists at tap point | Open Note Input Sheet (3.4.4) for that note | 3.4.4 |
| 6 | Tap bookmark button | Always | Toggle bookmark (3.4.5) | 3.4.5 |
| 7 | Tap single word | No selection | Dictionary lookup (Item 11) — floating card | 2.4 |
| 8 | Swipe from bottom edge up | Toolbar hidden | Show Reading Toolbar (3.2) | 3.2 |
| 9 | Swipe from top edge down | In fullscreen, chrome hidden | Exit fullscreen / show all chrome (3.1) | 3.1 |
| 10 | Swipe from left edge right | Menu collapsed | Expand menu (2.2) | 2.2 |
| 11 | Swipe from right edge left | Menu expanded | Collapse menu (2.2) | 2.2 |
| 12 | Long press on text | Any text | Start selection → show handles (3.4.1) + Selection Toolbar (3.4.2) | 3.4 |
| 13 | Double-tap word | Any word, no selection | Select that single word + show Selection Toolbar (3.4.2) | 3.4 |
| 14 | Triple-tap | EPUB/TXT/MOBI paragraph | Select whole paragraph + Selection Toolbar | 3.4 |
| 15 | Drag selection handles | Selection active | Expand/shrink selection range (3.4.1) | 3.4 |
| 16 | Swipe horizontally | EPUB in paginate mode, no selection | Turn page (previous/next) — alternative to tap edges | 3.3 |
| 17 | Swipe vertically | EPUB in scroll mode, no selection | Scroll through content — alternative to tap edges | 3.3 |
| 18 | Pinch | PDF mode | Zoom in/out (Section 3.3 — PDF) | 3.3 |
| 19 | Double tap | PDF mode, no selection | Zoom to next level: fit-page → 100% → 200% → fit-page | 3.3 |
| 20 | Long-press on progress strip (300ms) | Any reading mode | Expand progress scrubber (3.10.2) | 3.10 |
| 21 | Swipe up from progress strip | Any reading mode | Same as 20 — expand scrubber | 3.10 |
| 22 | Drag thumb on expanded scrubber | Scrubber expanded | Scrub through book (3.10.2) — haptic at boundaries | 3.10 |
| 23 | Back button (hardware) | Menu or any overlay open | Dismiss topmost overlay (priority: selection toolbar > note sheet > TOC > settings > theme panel > TTS expanded > progress sheet > toolbar). If nothing open and in fullscreen: exit fullscreen. If nothing open and not fullscreen: exit reader to library | 3.1 |
| 24 | Back button | Nothing open, not fullscreen | Exit reader → return to Library | 3.1 |

**Gesture Conflict Resolution:**
- Long press vs Tap: threshold 400ms. < 400ms = tap. ≥ 400ms = long press (selection).
- Horizontal swipe vs Tap: threshold 20dp movement. < 20dp = tap. ≥ 20dp = swipe.
- Tap on highlight vs Tap on word: highlight hit-target is larger (includes 4dp padding around highlight bounds). Highlight takes priority over dictionary tap.

---

## 7. Reading Toolbar — Feature Quick Access Summary

> The toolbar (3.2) is the quick-access strip. This table is a cross-reference — every toolbar element jumps to the full panel spec elsewhere in this document.

| Toolbar Element | Jumps To | Always Visible | Full Spec |
|-----------------|----------|----------------|-----------|
| Page number | Page Thumbnails panel (3.5) | Yes | 3.5 |
| Chapter name | TOC panel (3.6) | Yes | 3.6 |
| Bookmark icon | Bookmark toggle (3.4.5) + Bookmarks panel (Item 2) | Yes | 3.4.5 |
| Color selector | Highlight picker (3.4.3) | Yes | 3.4.3 |
| Menu toggle | Rectangular Menu expand/collapse (2.2) | Yes | 2.2 |
| (When active) TTS mini-player | TTS controls (3.9) | When TTS active | 3.9 |

---

## 8. Accessibility — Reading Screen

| Requirement | Implementation | Covers |
|-------------|----------------|--------|
| TalkBack | Menu items announce name and state ("Chapters, button. Collapsed." / "Read Aloud, button. Active."). Reading content announces page number and chapter. Selection toolbar buttons announce label and action. Note sheet announces "Add Note, editing" with anchor text | Menu (2), Selection toolbar (3.4.2), Note sheet (3.4.4), TOC (3.6), Settings (3.7), TTS mini-player (3.9), Progress sheet (3.10) |
| Reading content semantics | Each paragraph is a separate accessibility node. Current page/chapter announced on page turn. "Page 42 of 312, Chapter 3" on every navigation | Full screen layout (3.1), Reading modes (3.3) |
| Dynamic Type | Font settings (3.8) respected; minimum readable size 12sp in reader; menu labels scale per system `fontScale` setting. Layouts never break at 2× scale — toolbar wraps, sheets scroll | Theme/Font panel (3.8), Toolbar (3.2), Menu (2) |
| High Contrast | Menu `bg-card-dark` + white icons = 15.3:1. Light theme `text-primary` on `#FFFFFF` = 15.8:1. Dark theme `text-inverse` on `#1C1C1E` = 14.9:1. All meet WCAG AAA (7:1). Highlights in high-contrast: border 2dp `text-primary` around highlight fill | All reading themes (3.8 Section D), Toolbar (3.2), Progress strip (3.10.1) |
| Reduced Motion | All animations disabled when system "Reduce motion" is on: menu slide → instant show/hide, page curl → None (3.3), toolbar slide → instant, scrubber expand → instant, ring draw → instant final state | Every animated element in Sections 2–3 |
| Switch Access | Menu items top-to-bottom, each focusable. Reading content focusable page by page. Toolbar items focusable left-to-right. Sheet contents focusable top-to-bottom in DOM order. Note input auto-focused when sheet opens | Menu (2), Annotation UI (3.4), All sheets/panels |
| Selection handles | Native Android handles are accessible — TalkBack announces "Selected text: [snippet]. Actions: Copy, Highlight, Add note, Define" | Annotation UI (3.4.1–3.4.2) |
| TTS + TalkBack conflict | When both TTS (3.9) and TalkBack are active, TTS ducks (lowers volume) when TalkBack speaks. TTS highlight sync (underlines) pauses while TalkBack is speaking | TTS (3.9) |
| Keyboard / external | Note input (3.4.4) works with physical keyboard. Tab order: sheet header → anchor → input → Cancel → Save → delete. Enter = Save. Escape = Cancel with discard check | Note sheet (3.4.4) |
| Menu collapse shortcut | Hardware menu button or system gesture opens/closes menu. Also: Back dismisses overlays (see Gesture Map #23) | Menu (2.2), Gesture Map (6) |

---

## 9. Assets Required

| Asset | Quantity | Source | Notes |
|-------|----------|--------|-------|
| Lucide icon pack | NPM (`lucide-react-native`) | `lucide-react-native` | All icons — no custom assets. 12 menu + 6 toolbar + TTS + scrubber + sheets. See `docs/phase-3.md` Section 2.6 |
| Highlight color indicators | 6 | Generated (color values) | Yellow, Green, Blue, Pink, Orange, Purple — 32dp/24dp circles. No image asset |
| Annotation selection toolbar | 1 component | Built from Lucide icons | Pill `bg-card-dark`, 5 buttons + color picker row. No image asset |
| Menu & toolbar backgrounds | Solid colors | Token values | `bg-card-dark`, `bg-card` — no image asset |
| Empty state illustrations | 3 | Design phase | "No bookmarks yet" + "No notes yet" + "No highlights yet" — friendly illustrations, 240×160dp, `text-secondary` palette |
| Active state icon background | 1 component | Generated | White circle 24dp behind active menu icon. No image asset |
| Page transition preview | 1 component | Built | 60×80dp animated mock in Theme panel Section F (3.8) |
| TTS mini-player + expanded player | 1 component | Built | Combined chrome (3.9) — no image asset |
| Progress strip & scrubber | 1 component | Built | 2dp strip + 32dp expanded with thumb + ticks (3.10) |
| Reading history mini-graph | 1 component | Built (7 bars) | In Progress sheet (3.10.3). No image asset |
| TOC thumbnail placeholders | Generated | Built | Page number blocks or rendered snapshots (3.5). No static asset |
| Dictionary floating card | 1 component | Built | Bottom sheet card (Item 11). No image asset |

---

## 10. Document Navigation

| Document | Phase | Status |
|----------|-------|--------|
| `docs/phase-0.md` | Product Definition | Complete |
| `docs/phase-1.md` | Legal & Content | Complete |
| `docs/phase-2.md` | Technical Architecture | Complete |
| `docs/phase-3.md` | Design Spec (Home Screen) | Complete |
| `docs/phase-3-reader.md` | Design Spec (Reader Screen + Menu) | **Complete** |
| `docs/phase-4.md` | Development Roadmap & Integration Wiring | Complete |
| `docs/phase-5.md` | Testing, Performance, Deployment & Risks | Complete |

---

## 11. How to Use This Document

- **Designers:** Use Section 2 for menu tokens, Section 3.1–3.10 for every reader subsystem. Each of the 10 subsections in Section 3 is independently buildable — start hi-fi mockups with 3.1 (layout modes), then 3.4 (annotations), then the rest. Cross-reference the Lucide pack in `docs/phase-3.md` Section 2.6.
- **Developers:** Section 3.1–3.10 are the implementation checklist — 10 standalone specs. Section 5 (menu states) and Section 6 (gesture map) define states and conflict resolution. Section 4 is the format matrix — know what works per format. No code belongs in this doc.
- **AI Agents:** This is the design truth source for the reader screen. All menu items (2.4), every subsystem (3.1–3.10), icons, colors, behaviors, and overlays are defined here. Generate designs aligned with these specs. Do NOT invent new menu items, reading modes, or gestures without updating this document first.
- **All:** If Apple Books adds a feature we haven't covered, add it to the menu items list (2.4), detail its UI in the relevant Section 3 subsection, and update the format matrix (4).
