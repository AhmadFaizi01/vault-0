# Vault — Full Stack Setup Guide

## Stack
| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Backend  | Go + Gin + GORM + PostgreSQL + JWT        |
| Web      | Existing HTML/CSS/JS → PWA                |
| Android  | Capacitor (wraps web app → native APK)    |
| iOS      | Capacitor (wraps web app → native IPA)    |
| DevOps   | Docker Compose                            |

---

## 1. Run locally (Docker — easiest)

```bash
# From the repo root
cp backend/.env.example backend/.env
# Edit .env and set a real JWT_SECRET

docker-compose up --build
```

- Web app: http://localhost
- API:     http://localhost:8080/health

---

## 2. Run backend manually (Go required)

```bash
cd backend
cp .env.example .env
# Start Postgres first (or use docker-compose up postgres)
go run .
```

---

## 3. Run frontend manually

Any static server works:

```bash
cd frontend
npx serve .          # or: python3 -m http.server 3000
```

Open http://localhost:3000 — set `window.VAULT_API_BASE = 'http://localhost:8080'`
in browser console to connect to your local API.

---

## 4. Build Android app (Capacitor)

Prerequisites: Android Studio, Node.js 18+

```bash
cd mobile
npm install

# Add Android platform (first time only)
npx cap add android

# Copy latest frontend + sync
npx cap sync android

# Open in Android Studio to build APK / run on device
npx cap open android
```

To run directly on a connected device:
```bash
npx cap run android
```

---

## 5. Build iOS app (Capacitor)

Prerequisites: macOS + Xcode 15+, Node.js 18+

```bash
cd mobile
npm install

# Add iOS platform (first time only)
npx cap add ios

# Sync
npx cap sync ios

# Open in Xcode to build / sign / archive
npx cap open ios
```

---

## 6. Build Desktop app — Windows / Mac / Linux (Tauri)

Prerequisites: [Rust](https://rustup.rs) + Node.js 18+

### One-time setup
```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
cd desktop
npm install
```

### Run in dev mode (hot-reload)
```bash
# Serve the frontend first
cd frontend && npx serve -l 3000 &

# Launch desktop app with dev tools
cd desktop && npm run dev
```

### Build installers
```bash
cd desktop
npm run build
```

Output goes to `desktop/src-tauri/target/release/bundle/`:
| Platform | Output |
|----------|--------|
| Windows  | `nsis/Vault_1.0.0_x64-setup.exe` + `msi/Vault_1.0.0_x64.msi` |
| macOS    | `dmg/Vault_1.0.0_x64.dmg` |
| Linux    | `appimage/vault_1.0.0_amd64.AppImage` + `deb/vault_1.0.0_amd64.deb` |

> **PWA alternative (no install required):**  
> Visit the hosted app in Chrome or Edge → click the install icon in the address bar.  
> The app opens like native (no browser chrome, taskbar icon, offline support).

---

## 7. Deploy to production

### Backend (any Linux server / Railway / Fly.io / Render)

```bash
# Build a tiny binary
cd backend
CGO_ENABLED=0 GOOS=linux go build -o vault-api .

# Run with env vars
JWT_SECRET=your-secret DB_HOST=... ./vault-api
```

### Frontend (Netlify / Vercel / Cloudflare Pages)

```bash
# Set the API URL in index.html before deploying:
# window.VAULT_API_BASE = 'https://api.yourdomain.com';

# Then deploy the frontend/ folder
```

---

## API Reference

### Auth
| Method | Path               | Body                             |
|--------|--------------------|----------------------------------|
| POST   | /api/auth/register | name, email, password, ...       |
| POST   | /api/auth/login    | email, password                  |
| GET    | /api/auth/me       | —                                |
| PUT    | /api/auth/me       | name, theme, currency_code, ...  |

### Transactions
| Method | Path                       | Notes              |
|--------|----------------------------|--------------------|
| GET    | /api/transactions          | ?month, ?search    |
| POST   | /api/transactions          | Create             |
| PUT    | /api/transactions/:id      | Update             |
| DELETE | /api/transactions/:id      | Delete             |
| POST   | /api/transactions/import   | Bulk CSV import    |

### Subscriptions / Goals / Budgets
Standard CRUD: GET, POST, PUT /:id, DELETE /:id

### Insights
| Method | Path           | Returns                                    |
|--------|----------------|--------------------------------------------|
| GET    | /api/insights  | income, spent, by_category, daily_velocity |
