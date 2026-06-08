# How to use

Guide for running, customizing, testing, and deploying Online-PDF-CV.

---

## Prerequisites

| Requirement  | Version                                |
| ------------ | -------------------------------------- |
| Node.js      | ≥ 22.0.0 (see `.nvmrc`)                |
| npm          | Bundled with Node                      |
| Firebase CLI | For deploy (`npm i -g firebase-tools`) |
| Git          | For contribution workflow              |

---

## Quick start (local)

```bash
git clone https://github.com/benmed00/Online-PDF-CV.git
cd Online-PDF-CV
npm install
npm start
```

Open **http://localhost:3000**

Alternative entrypoint (direct `app.js`):

```bash
npm run dev
```

---

## Replace your resume

### Default PDF

Replace `public/resume.pdf` with your file. The home page and `/resume` route serve this file.

### Named versions

1. Add PDFs under `public/resumes/` (e.g. `technical.pdf`, `executive.pdf`).
2. Access via `/resume/technical`, `/resume/executive`.
3. Or use the helper script:

```bash
npm run add-version -- /path/to/your.pdf technical
```

### List available versions

- **Browser:** visit `/compare` or `/docs`
- **API:** `GET /api/versions` → JSON list with download URLs

---

## Application pages

| URL                 | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `/`                 | Home — embedded default PDF resume                       |
| `/resume`           | Default PDF download/view                                |
| `/resume/:version`  | Named version (slug: lowercase letters, digits, hyphens) |
| `/docs`             | Human-readable API documentation                         |
| `/api/openapi.yaml` | OpenAPI 3.1 specification (canonical contract)           |
| `/api/docs`         | Swagger UI (Express server only)                         |
| `/analyzer`         | Paste resume text → keyword analysis                     |
| `/compare`          | Side-by-side PDF comparison                              |
| `/api/versions`     | JSON versions API                                        |
| `POST /api/analyze` | Resume analysis API (JSON body; Express only)            |

Example — fetch the OpenAPI spec:

```bash
curl -s http://localhost:3000/api/openapi.yaml | head
curl -s http://localhost:3000/api/versions
```

---

## Environment variables

| Variable             | Default                 | Purpose                                                        |
| -------------------- | ----------------------- | -------------------------------------------------------------- |
| `PORT`               | `3000`                  | HTTP port                                                      |
| `NODE_ENV`           | —                       | `development` shows stack traces on error pages                |
| `SITE_URL`           | `http://localhost:3000` | Canonical URL used by `npm run build`                          |
| `VIRUSTOTAL_API_KEY` | —                       | VirusTotal scan on server-side uploads (`/api/extract-resume`) |
| `OPENAI_API_KEY`     | —                       | AI Coach insights on `/analyzer` (`POST /api/analyze`)         |
| `OPENAI_MODEL`       | `gpt-4o-mini`           | Optional OpenAI model override                                 |

Copy `.env.example` to `.env` for analyzer keys. **Firebase static hosting does not run these APIs** — use Express locally or self-hosted for full analyzer features.

Example production build:

```bash
SITE_URL=https://benyakoub-cv.firebaseapp.com npm run build
```

---

## npm scripts reference

| Script                    | Command                            | When to use                                                             |
| ------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| `start`                   | `node ./bin/www`                   | Normal local/production server                                          |
| `dev`                     | `node app.js`                      | Direct app start (no bin wrapper)                                       |
| `build`                   | Static HTML generation             | **Required before Firebase deploy**                                     |
| `test`                    | Jest unit tests                    | After code changes                                                      |
| `test:coverage`           | Jest + coverage                    | CI / quality review                                                     |
| `test:e2e`                | Playwright usability               | UI regression checks                                                    |
| `test:e2e:analyzer`       | Analyzer workflow e2e only         | Full `/analyzer` path, edge cases, API mocks                            |
| `test:all`                | validate:full + copy e2e artifacts | Pre-PR full pipeline (format, lint, audit, coverage, build, e2e, media) |
| `test:e2e:report`         | Open Playwright HTML report        | Debug failed e2e                                                        |
| `lint` / `lint:fix`       | ESLint                             | Code quality                                                            |
| `format` / `format:check` | Prettier                           | Match CI formatting gate                                                |
| `deploy`                  | `firebase deploy`                  | Publish to Firebase Hosting                                             |
| `add-version`             | Add resume PDF version             | Content updates                                                         |
| `generate-sitemap`        | Sitemap XML                        | SEO (`npm run generate-sitemap -- https://yourdomain.com`)              |
| `export`                  | Export resume formats              | JSON, TXT, Markdown                                                     |

---

## Deploy to Firebase

```bash
npm run build
firebase login
npm run deploy
```

CI deploys automatically on merge to `master` when Firebase secrets are configured (see [wiki/Deployment.md](../wiki/Deployment.md)).

---

## Run tests before a pull request

```bash
npm run test:all
```

This runs Jest, builds static files, executes Playwright (desktop + mobile), and copies screenshots/videos to `docs/assets/`.

---

## Logs

Winston writes to:

- Console (all levels)
- `logs/all.log`
- `logs/error.log`

Log directory is gitignored; created automatically on first run.

---

## Contribution workflow

1. Fork [benmed00/Online-PDF-CV](https://github.com/benmed00/Online-PDF-CV) if you are an external contributor.
2. Create a feature branch from `master`.
3. Run `npm run test:all` before opening a pull request.
4. Open a PR against `benmed00/Online-PDF-CV` `master`.

See [be-aware.md](be-aware.md) for security and deployment cautions.
