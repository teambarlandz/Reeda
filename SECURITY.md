# Security Policy

## Reporting a Vulnerability

Email the maintainers or open a private security advisory on GitHub. Do not open a public issue for security vulnerabilities.

We will acknowledge within 72 hours and aim to patch within 14 days for critical issues.

## Scope

Reeda is local-only for MVP (no cloud sync, no auth) per `docs/phase-1.md:5.3`. Books, highlights, notes, progress stay on device in `getFilesDir` / SQLite. No broad storage permission — only SAF `ACTION_OPEN_DOCUMENT`.

Future crash reporting (Firebase Crashlytics) will be disclosed in `docs/phase-1.md:5.3` and Privacy Policy before enabling.
