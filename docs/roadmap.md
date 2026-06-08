# Roadmap

Release planning for Online-PDF-CV. Current package version **4.1.0**.

> **Version note:** Git milestone **v3.6.2 platform hardening** shipped as package/git tag **v4.0.0**. Analyzer wave is **v4.1.0**. See [CHANGELOG.md](../CHANGELOG.md).

---

## Shipped — v4.0.0 / v3.6.2 platform hardening (2026-06)

**Status:** Merged ([PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31), tag `v4.0.0`)

| Area             | Outcome                                              |
| ---------------- | ---------------------------------------------------- |
| Express 5        | Compatible routing, explicit 404, no merge conflicts |
| Security         | Helmet CSP, path validation, dependency audit clean  |
| Infrastructure   | Winston logging, AppError, hybrid error handler      |
| Firebase         | Static build pipeline, rewrites for tools and API    |
| Testing          | Jest + Playwright, CI workflow                       |
| Documentation    | README media, wiki/, `docs/` maintainer guides       |
| Package metadata | Author, license, repository, keywords                |

---

## Shipped — v4.1.0 analyzer & quality gates (2026-06)

**Status:** Merged ([PR #32](https://github.com/benmed00/Online-PDF-CV/pull/32), tag `v4.1.0`)

| Area            | Outcome                                                       |
| --------------- | ------------------------------------------------------------- |
| Analyzer        | Upload extraction, VirusTotal, OpenAI coach                   |
| Cloud Functions | `api` function for production analyzer APIs on Firebase       |
| Quality         | Husky hooks, version sync, Dependabot, `npm audit` in CI      |
| OpenAPI         | JSDoc-generated spec, Redocly lint, Swagger UI (Express only) |

---

## Phase 2 — Post-release stabilization (Q3 2026)

| Item                          | Priority | Notes                                                                                                                                 |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Sync wiki to GitHub Wiki      | Done     | Live at [GitHub Wiki](https://github.com/benmed00/Online-PDF-CV/wiki); re-run `.\scripts\sync-wiki-to-github.ps1` after `wiki/` edits |
| Firebase PDF fallback parity  | High     | Match Express fallback behavior                                                                                                       |
| Surface CI checks on fork PRs | Medium   | Upstream Actions settings                                                                                                             |
| Codecov integration           | Low      | Add `CODECOV_TOKEN` secret                                                                                                            |

---

## Phase 3 — Product enhancements (Q4 2026)

| Item                       | Priority | Notes                                    |
| -------------------------- | -------- | ---------------------------------------- |
| Job description matcher UI | Medium   | `/validate` scaffold exists              |
| Resume export improvements | Medium   | JSON, TXT, Markdown via `npm run export` |
| PWA / offline polish       | Low      | `manifest.json`, service worker present  |
| Automated wiki sync CI job | Low      | GitHub Action from `wiki/`               |

---

## Phase 4 — Platform & ops (2027)

| Item                             | Priority | Notes                                                 |
| -------------------------------- | -------- | ----------------------------------------------------- |
| Node.js 24 on GitHub Actions     | Medium   | Actions runner deprecation timeline                   |
| Remove unused Firebase client TS | Low      | `src/lib/firebase.ts`, `public/js/firebase-config.js` |
| Dependabot auto-merge policy     | Medium   | Reduce stale security PR noise                        |
| Custom domain + SSL docs         | Low      | Firebase custom domain guide                          |
| Analytics privacy review         | Low      | Google Analytics integration audit                    |

---

## Vision (long term)

- **Self-hosted resume platform** — one repo, static deploy, optional Node dev server
- **Recruiter-friendly tools** — analyzer, compare, API for integrations
- **Portfolio extensibility** — plugins or themes without forking core routing

---

## Version history

| Package | Milestone / theme                                           |
| ------- | ----------------------------------------------------------- |
| 4.1.0   | Analyzer APIs, Cloud Functions, Husky, OpenAPI              |
| 4.0.0   | Platform hardening (milestone v3.6.2), Express 5, e2e       |
| 3.6.2   | `working-messy-code` tag — minimal Firebase PDF host (2023) |
| 1.x     | Initial Express + Jade CV host                              |

See [CHANGELOG.md](../CHANGELOG.md) for detailed release notes.  
See [project-history.md](project-history.md) and [releases/](releases/README.md) for the full timeline.
