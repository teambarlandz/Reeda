# Reeda

> A premium, feature-complete Android reading app that feels like it was built for people who genuinely love to read — `docs/phase-0.md:3`.

![Logo](logo.svg)

Warm, minimal library with immersive reader, rich annotations, and deep customization for students, religious readers, casual and power readers.

## Preview

Library grid (5 columns, warm cream `#F0EDE6`) and Reader with Rectangular Menu (collapsed 56dp ↔ expanded 220dp) — see `603d5406845a0ef07254c5da1dbf5b1f.jpg` and `96cbcac3221fead42ec8cc721f981424.jpg`.

## Install (Android — GitHub Releases)

1. Download latest `app-release.apk` from **Releases → Assets**
2. Enable **Install unknown apps** on Android
3. Open APK — SHA-256 shown in Release notes

No Play Store yet — GitHub sideload per `docs/phase-5.md:3.3`.

## Tech Stack

Bare React Native 0.73.11 + TypeScript strict + Hermes — `docs/phase-2.md:1`
Navigation: React Navigation 6 native-stack
State: Zustand + TanStack Query
DB: SQLite via `react-native-quick-sqlite` (8.1.0, FTS5 `books_fts`)
Covers: `react-native-fast-image`, gestures `gesture-handler + reanimated 3`
PDF: `react-native-pdf` (PDFium), TTS: `react-native-tts`

## Formats

EPUB (primary, reflowable), PDF (fixed, Option A invert), TXT, MOBI best-effort — `docs/phase-1.md:3.1`. DOCX shows “coming soon”, DRM files rejected.

## Docs

- `docs/phase-0.md` Product Definition
- `docs/phase-1.md` Legal & Content
- `docs/phase-2.md` Technical Architecture
- `docs/phase-3.md` Design — Home/Library
- `docs/phase-3-reader.md` Design — Reader + Menu
- `docs/phase-4.md` Roadmap (M1→M8)
- `docs/phase-5.md` Testing, Perf, Deployment

## Quick Start

```bash
cd app
npm install
npm run typecheck
npm test -- --ci
# Android (needs JDK 17 + Android SDK)
npx react-native run-android
```

See `CONTRIBUTING.md`.

## License

MIT — `LICENSE`.
