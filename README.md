# vc-travel-app

Monorepo of per-trip travel web apps. Each trip is a self-contained **React + Vite + Tailwind**
app in its own folder (`seoul-trip-2025/`, `honeymoon-trip-2026/`, …). There is **no traditional
backend** — a Google Apps Script Web App + one Google Sheet per trip is the database.

## Structure

```
shared/components/TripApp.jsx   # the whole app UI/logic (shared)
<trip>-YYYY/src/App.jsx         # ~60-line per-trip config passed to <TripApp>
scripts/gas-setup/              # Apps Script backend (Code.gs) + setup runbook
.github/workflows/deploy.yml    # matrix build → gh-pages
CLAUDE.md                       # dev rules & full "add a new trip" flow
docs/gas_performance_guide.md   # GAS batching/lock/flush rules
```

Each trip's `App.jsx` only supplies a `config` object (theme/ui, title, members, dates,
`weatherLocations`, `api.url`, …); all behaviour lives in `shared/components/TripApp.jsx`.

## Dev

```bash
cd <trip>-YYYY
npm install
npm run dev        # http://localhost:5173
npm run test       # vitest — must pass before deploy
npm run build
```

Node 18. "Done" = `npm run test` passes and `npm run build` succeeds in that trip's folder.

## Backend & auth (in one line)

One Web App per trip; the client POSTs `{ pin, type, action, ... }` to `config.api.url`. The login
PIN is verified **server-side** (Apps Script Script Properties), never in the repo/bundle. No env
vars, no GitHub secrets — the web-app URL is non-sensitive and lives in `config.api.url`.

## Deploy

Manual trigger: **Actions → Deploy Trips** (pick source branch). A matrix builds every trip and
publishes to `gh-pages`; if any trip's tests fail nothing deploys. Deploying is a **human gate** —
a person reviews the PR, does the one-time Google setup, and merges.

## Adding a new trip

See **[CLAUDE.md](./CLAUDE.md)** (the two-stage flow + intake) and
**[scripts/gas-setup/README.md](./scripts/gas-setup/README.md)** (the Apps Script backend runbook).
The human deploy-gate checklist also lives in Notion ("trip-app 發佈 SOP").

Traditional Chinese in UI copy and docs is expected — keep it.
