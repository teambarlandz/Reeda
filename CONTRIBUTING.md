# Contributing to Reeda

## How to Run

```bash
cd app
npm install          # node 22, npm 10.9+
npm run typecheck    # tsc --noEmit strict
npm test -- --ci     # Jest + RNTL, in-memory SQLite
```

Android: JDK 17, Android SDK 34, `npx react-native run-android`.

## Branching

GitHub Flow per `docs/phase-5.md:3.3`: default `main` always green, feature branches `feat/<name>` → PR to `main` with CI green.

## Code Style

- All colors/spacing/typography from `app/src/shared/theme/tokens.ts` — no hardcoded hex outside tokens
- Icons via `src/shared/icons` re-export only — never `from 'lucide-react-native'` directly
- `features/*` do not cross-import — shared code goes in `shared/` or `data/`
- Repositories are only DB access — screens/hooks never import `db` directly

## Design Truth

`docs/phase-3.md` + `docs/phase-3-reader.md` are source of truth. Token changes go to `phase-3.md:2` first.

## Testing

Journeys J1–J12 `docs/phase-4.md:4` must stay green after every milestone. See `docs/phase-5.md:1`.

## Dead Code

No undeclared dead code `docs/phase-4.md:6`. Declare in PR if temporarily dead.
