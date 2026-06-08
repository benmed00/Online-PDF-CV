# Firebase Cloud Functions — `api`

Production analyzer APIs on Firebase Hosting are served by the **`api`** HTTPS Cloud Function, not static files.

## What it runs

`functions/src/index.ts` exports `api`, which wraps the shared Express API app from `api-server.js` (synced into `functions/shared/` at build time).

| Route                         | Method | Purpose                                 |
| ----------------------------- | ------ | --------------------------------------- |
| `/api/analyzer/config`        | GET    | Capability flags (OpenAI, VT, …)        |
| `/api/analyze`                | POST   | Keyword scoring + optional AI           |
| `/api/extract-resume`         | POST   | Upload, VirusTotal scan, extract        |
| `/api/extract-resume-version` | POST   | Extract text from hosted PDF by version |

`firebase.json` rewrites these paths from Hosting to the function.

## Prerequisites

- Firebase CLI (`firebase login`)
- Node.js 22 (matches root `package.json` and `.nvmrc`)
- Secrets: `OPENAI_API_KEY`, `VIRUSTOTAL_API_KEY` (optional but enable full features)

## Local development

**Option A — full Express app (recommended for UI work):**

```bash
# From repo root
cp .env.example .env   # add keys
npm start
```

**Option B — Functions emulator:**

```bash
cd functions
npm install
cp ../.env.example .env   # emulator reads dotenv via shared api-server
npm run serve
```

## Build

`npm run build` inside `functions/`:

1. `scripts/sync-shared.js` — copies `api-server.js`, `routes/api.js`, and `utils/` into `functions/shared/`
2. `tsc` — compiles TypeScript to `lib/`

Root `firebase deploy` runs `functions` predeploy hooks (lint + build) automatically.

## Deploy

From repo root (after static build):

```bash
npm run build
firebase deploy --only functions,hosting
```

Functions only:

```bash
cd functions && npm run deploy
```

## Environment variables / secrets

Set in Firebase (Console → Functions → environment, or CLI secrets):

| Variable             | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | AI Coach on `/api/analyze`                                             |
| `VIRUSTOTAL_API_KEY` | Scan on `/api/extract-resume`                                          |
| `OPENAI_MODEL`       | Optional model override                                                |
| `HOSTING_URL`        | Base URL for hosted-CV PDF fetch on Functions (defaults to `SITE_URL`) |

Local Express and the emulator use root `.env` via `dotenv` in `api-server.js`.

## Scripts

| Command               | Purpose                               |
| --------------------- | ------------------------------------- |
| `npm run build`       | Sync shared code + compile TypeScript |
| `npm run serve`       | Build + Functions emulator            |
| `npm run deploy`      | Deploy functions only                 |
| `npm run logs`        | Tail function logs                    |
| `npm run sync-shared` | Copy API code from repo root          |

## Related documentation

- [docs/how-it-works.md](../docs/how-it-works.md) — architecture
- [wiki/Deployment.md](../wiki/Deployment.md) — full Firebase deploy guide
- [docs/known-issues.md](../docs/known-issues.md) — hosting-only vs functions deploy
