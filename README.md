# Vault — Personal Finance

A beautiful personal finance companion. Track spending, set goals, manage subscriptions, and visualise your financial health.

## Platforms

| Platform | How | Output |
|----------|-----|--------|
| **Web**      | PWA served via Nginx + Go backend | Browser + installable via Chrome/Edge |
| **Desktop**  | Tauri wraps the frontend | `.exe` (Win) · `.dmg` (Mac) · `.AppImage` (Linux) |
| **Android**  | Capacitor wraps the frontend | `.apk` / Play Store |
| **iOS**      | Capacitor wraps the frontend | `.ipa` / App Store |

All four share the **same HTML/CSS/JS frontend** — zero code duplication.

## Stack

```
backend/   Go + Gin + GORM + PostgreSQL + JWT
frontend/  HTML + CSS + JS (PWA)
desktop/   Tauri (Rust shell → native desktop)
mobile/    Capacitor (native Android + iOS shell)
```

## Quick start (Docker)

```bash
docker-compose up --build
```

- Web: http://localhost
- API: http://localhost:8080

See [SETUP.md](SETUP.md) for full build instructions for each platform.
