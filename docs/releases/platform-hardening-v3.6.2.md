# Release: Platform hardening v3.6.2

**Branch:** `platform-hardening-and-docs`  
**Merged:** [PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31) (2026-06-07)  
**Package version:** `4.0.0` (git tag `v4.0.0`; milestone name **v3.6.2 platform hardening**)  
**Theme:** Transform a broken minimal PDF host into a production-ready resume platform.

This release supersedes the [`working-messy-code`](working-messy-code.md) era and resolves merge conflicts from the earlier `feature/enhance-refactor-optimize` workstream.

---

## Executive summary

| Metric           | Before (base)                         | After (this release)                  |
| ---------------- | ------------------------------------- | ------------------------------------- |
| App state        | Merge conflicts, would not start      | Clean, buildable, tested              |
| Home page        | Firebase boilerplate OR PDF wildcard  | Pug home with nav + PDF iframe        |
| Production tools | Express-only (local)                  | Pre-rendered static HTML on Firebase  |
| Error handling   | Broken `createError`, unreachable 404 | `AppError` + hybrid JSON/HTML handler |
| Logging          | `morgan` listed but unused            | Winston (console + file)              |
| Security         | No Helmet, path traversal risk        | Helmet + CSP, slug validation         |
| Tests            | None / stubs                          | 22 Jest + 14 Playwright               |
| npm audit        | 11 vulnerabilities                    | 0 vulnerabilities                     |

---

## New features

| Feature               | Route / artifact                | Description                        |
| --------------------- | ------------------------------- | ---------------------------------- |
| Multi-version resumes | `/resume/:version`              | PDFs from `public/resumes/`        |
| Versions API          | `/api/versions`                 | JSON list of available versions    |
| API docs              | `/docs`                         | Interactive endpoint documentation |
| Resume analyzer       | `/analyzer`                     | Keyword coverage and suggestions   |
| Resume comparison     | `/compare`                      | Side-by-side PDF viewer            |
| Static build          | `npm run build`                 | Pre-render Pug → HTML for Firebase |
| Export scripts        | `npm run export`                | JSON, TXT, Markdown                |
| Sitemap               | `npm run generate-sitemap`      | SEO sitemap generation             |
| PWA scaffolding       | `manifest.json`, service worker | Installable web app metadata       |

---

## Architecture (two runtime modes)

### Local development — Express 5

```
Browser → Express (app.js) → Pug views
                          → public/resumes/*.pdf
                          → utils/ (logger, AppError, getResumeVersions)
```

### Production — Firebase Hosting

```
Browser → Firebase CDN → public/*.html (pre-built)
                       → public/resumes/*.pdf
                       → public/api/versions.json

npm run build renders Pug → public/ before deploy
```

See [How it works](../how-it-works.md) for route tables and rewrite rules.

---

## Key commits in this release

| Commit    | Type     | Summary                                         |
| --------- | -------- | ----------------------------------------------- |
| `6b84509` | feat     | Resume export, analyzer, compare, docs views    |
| `ceaca50` | feat     | Winston logging, AppError, error handler        |
| `2636c54` | refactor | Express 5 routing, Helmet, version validation   |
| `febffa2` | refactor | Jade → Pug migration, styled error page         |
| `b30f6cf` | build    | Static site generator + Firebase rewrites       |
| `c2ea3df` | test     | Jest rewrite, coverage thresholds, CI on master |
| `7ce7d1c` | chore    | Dependency audit fix, gitignore, SECURITY.md    |
| `653d093` | test     | Playwright e2e + media capture                  |
| `072a071` | docs     | README, wiki, screenshots, videos               |
| `08a226e` | ci       | Playwright job + artifact uploads               |

---

## Bugs fixed (vs `working-messy-code` and conflicted base)

| Issue                                                     | Fix                                          |
| --------------------------------------------------------- | -------------------------------------------- |
| Merge conflict markers in `app.js`, `package.json`, views | Fully resolved                               |
| `app.get('*')` wildcard serving PDF for all routes        | Explicit route table                         |
| Routers imported but never mounted                        | `app.use('/', indexRouter)`                  |
| 404 handler unreachable                                   | Middleware-based 404 after routes            |
| Static `index.html` hijacking home route                  | `express.static({ index: false })`           |
| Path traversal on `/resume/../../`                        | `validateVersion.js` slug regex `[a-z0-9-]+` |
| CI triggered on `main` (repo uses `master`)               | Workflow trigger corrected                   |
| Empty `build` script                                      | `scripts/build-static.js`                    |

---

## Test coverage

| Suite              | Command                 | Scope                           |
| ------------------ | ----------------------- | ------------------------------- |
| Unit / integration | `npm test`              | API, routes, utils, build       |
| Coverage           | `npm run test:coverage` | Core modules 75%+               |
| Static build       | `npm run build`         | 5 HTML/JSON outputs             |
| Usability e2e      | `npm run test:e2e`      | Desktop + mobile Playwright     |
| Full pipeline      | `npm run test:all`      | test → build → e2e → media copy |

Media assets published under [`docs/assets/`](../assets/README.md).

---

## Post-merge follow-ups

Documented in [roadmap.md](../roadmap.md) Phase 2:

- Firebase PDF fallback parity for missing versions
- Sync `wiki/` to GitHub Wiki ([Sync-Wiki.md](../../wiki/Sync-Wiki.md))
- Run `npm run build` before every production deploy
- Remove or wire unused Firebase client scaffolding

---

## Related documentation

| Document         | Link                                                               |
| ---------------- | ------------------------------------------------------------------ |
| Previous release | [working-messy-code.md](working-messy-code.md)                     |
| Full timeline    | [project-history.md](../project-history.md)                        |
| Architecture     | [how-it-works.md](../how-it-works.md)                              |
| Roadmap          | [roadmap.md](../roadmap.md)                                        |
| PR #31 body      | [GitHub PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31) |
| Wiki version     | [Project-History](../../wiki/Project-History.md)                   |
