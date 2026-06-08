# How it works

Architecture overview for Online-PDF-CV v4.1.0.

---

## High-level picture

```mermaid
flowchart TB
  subgraph dev [Local development]
    Browser --> Express
    Express --> Pug[Pug templates]
    Express --> PDF[public/resumes/*.pdf]
    Express --> Utils[utils/ helpers]
  end

  subgraph prod [Firebase Hosting production]
    Browser2[Browser] --> Firebase[Firebase CDN]
    Firebase --> StaticHTML[public/*.html]
    Firebase --> StaticPDF[public/resumes/*.pdf]
    Firebase --> APIJson[public/api/versions.json]
    Firebase --> CloudFn[Cloud Function api]
    CloudFn --> ApiRoutes[routes/api.js]
  end

  Build[npm run build] --> StaticHTML
  Build --> APIJson
  Pug -. pre-render .-> Build
```

---

## Two runtime modes

### 1. Express server (development & Node hosting)

`bin/www` starts Express. `app.js` configures:

| Layer            | Responsibility                                                                         |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Helmet**       | Security headers + CSP (allows PDF iframe on same origin)                              |
| **Winston**      | HTTP request logging                                                                   |
| **Routes**       | Pages, PDF delivery, JSON API                                                          |
| **errorHandler** | JSON for `/api/*`, HTML `error.pug` for browsers                                       |
| **Static files** | `express.static('public', { index: false })` — home route serves Pug, not `index.html` |

Key routes are defined in `app.js` (API, resume PDFs) and `routes/index.js` (tool pages).

### 2. Static hosting (Firebase production)

Firebase serves files from `public/` with **no Node runtime**.

Before deploy, `scripts/build-static.js`:

1. Renders Pug views → `public/index.html`, `public/docs/`, `public/analyzer/`, `public/compare/`, `public/validate/`, `public/404.html`
2. Writes `public/api/versions.json` from disk scan of `public/resumes/`

`firebase.json` rewrites:

| Request                | Destination             |
| ---------------------- | ----------------------- |
| `/api/analyze`         | Cloud Function `api`    |
| `/api/extract-resume`  | Cloud Function `api`    |
| `/api/analyzer/config` | Cloud Function `api`    |
| `/api/versions`        | `/api/versions.json`    |
| `/resume`              | `/resume.pdf`           |
| `/resume/:version`     | `/resumes/:version.pdf` |

---

## Resume version discovery

`utils/getResumeVersions.js` scans `public/resumes/` for `*.pdf` files and returns metadata (slug, filename, URL path).

Version slugs are validated by `utils/validateVersion.js`:

```regex
/^[a-z0-9-]+$/
```

Invalid slugs → 400 on Express (both API and browser routes).

---

## Request flow — PDF delivery

```
GET /resume/technical
  → isValidVersion('technical') ?
  → fs.existsSync('public/resumes/technical.pdf') ?
  → sendFile OR fallback to resume.pdf (Express only)
```

**Express** falls back to `public/resume.pdf` when a named file is missing.  
**Firebase** returns 404 for missing rewrite targets (see [known-issues.md](known-issues.md)).

---

## Resume analyzer

| Component                            | Role                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| `views/analyzer.pug`                 | UI shell                                                      |
| `public/javascripts/analyzer-app.js` | Client-side form + fetch (offline fallback when API missing)  |
| `utils/resumeAnalyzer.js`            | Keyword scoring, suggestions                                  |
| `routes/api.js`                      | `POST /api/analyze`, `POST /api/extract-resume`, config route |
| `api-server.js` + `functions/`       | Same API on Express locally and Cloud Function in production  |

Target roles: `engineering`, `management`, `general`.

See [functions/README.md](../functions/README.md) for deploy and secrets.

---

## Error handling

```
Operational error (AppError / ValidationError)
  → statusCode + message
  → /api/*  → JSON { success: false, status, statusCode, message, error, validation? }
  → browser → render error.pug (stack in development only)

Unknown error
  → 500, logged via Winston
  → production masks internal message for non-operational errors
```

Process-level hooks in `utils/processHandlers.js` (used by `bin/www` and `npm run dev`) exit on uncaught exceptions and unhandled rejections.

The analyzer client uses `public/javascripts/api-client.js` for consistent fetch error handling and shows an explicit offline fallback message when the server is unreachable.

---

## Testing layers

| Layer              | Tool             | Scope                                         |
| ------------------ | ---------------- | --------------------------------------------- |
| Unit / integration | Jest + Supertest | Routes, utils, build script                   |
| End-to-end         | Playwright       | Full pages, navigation, PDF endpoints         |
| CI                 | GitHub Actions   | format → lint → test → build → coverage → e2e |

Playwright starts the app via `webServer: npm start` during tests.

---

## CI/CD pipelines

| Workflow                            | Trigger                                          | Purpose           |
| ----------------------------------- | ------------------------------------------------ | ----------------- |
| `ci.yml`                            | push/PR to `master`, feature branch push, manual | Quality gates     |
| `firebase-hosting-merge.yml`        | push to `master`                                 | Production deploy |
| `firebase-hosting-pull-request.yml` | PR (same repo only)                              | Preview channel   |

Fork PRs to upstream may not show CI checks until upstream enables fork workflow runs (see [be-aware.md](be-aware.md)).

---

## Directory map

```
Online-PDF-CV/
├── app.js                 # Express app, page routes, PDF delivery
├── api-server.js          # API-only Express app (local + Cloud Functions)
├── functions/             # Firebase Cloud Function `api` (production analyzer APIs)
├── bin/www                # HTTP server + crash hooks
├── routes/api.js          # JSON API routes
├── routes/index.js        # Home route
├── views/                 # Pug templates
├── utils/                 # logger, errors, resume helpers, analyzer
├── public/                # Static assets + build output
├── scripts/               # build-static, add-version, export, …
├── __tests__/             # Jest
├── e2e/                   # Playwright
├── .github/workflows/     # CI/CD
├── docs/                  # This documentation set
└── wiki/                  # GitHub Wiki source
```

---

## Related documentation

| Document                                                             | Topic                            |
| -------------------------------------------------------------------- | -------------------------------- |
| [Documentation index](README.md)                                     | Full docs hub                    |
| [Project history](project-history.md)                                | Timeline and refactor context    |
| [Release: working-messy-code](releases/working-messy-code.md)        | Pre-refactor architecture (2023) |
| [Release: platform hardening](releases/platform-hardening-v3.6.2.md) | Current era release notes        |
| [How to use](how-to-use.md)                                          | Scripts and workflows            |
| [Wiki: Development](../wiki/Development.md)                          | GitHub Wiki mirror               |
