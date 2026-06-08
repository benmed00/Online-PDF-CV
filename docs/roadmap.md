# Roadmap

Release planning for Online-PDF-CV. Aligned with milestone **v3.6.2 — Platform Hardening**.

---

## Current release — v3.6.2 (Platform Hardening)

**Target:** 2026-06-30  
**Status:** In review ([PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31))

### Delivered

| Area             | Outcome                                                  |
| ---------------- | -------------------------------------------------------- |
| Express 5        | Compatible routing, explicit 404, no merge conflicts     |
| Security         | Helmet CSP, path validation, dependency audit clean      |
| Infrastructure   | Winston logging, AppError, hybrid error handler          |
| Firebase         | Static build pipeline, rewrites for tools and API        |
| Testing          | Jest (22+ tests), Playwright (14 scenarios), CI workflow |
| Documentation    | README media, wiki/, `docs/` maintainer guides           |
| Package metadata | Author, license, repository, keywords                    |

---

## Phase 2 — Post-merge stabilization (Q3 2026)

| Item                          | Priority | Notes                           |
| ----------------------------- | -------- | ------------------------------- |
| Enable upstream GitHub Issues | Medium   | Blocked on repo owner           |
| Surface CI checks on fork PRs | High     | Upstream Actions settings       |
| Firebase PDF fallback parity  | High     | Match Express fallback behavior |
| Sync wiki to GitHub Wiki      | Medium   | Manual per `wiki/Sync-Wiki.md`  |
| Codecov integration           | Low      | Add `CODECOV_TOKEN` secret      |

---

## Phase 3 — Product enhancements (Q4 2026)

| Item                       | Priority | Notes                                    |
| -------------------------- | -------- | ---------------------------------------- |
| Job description matcher UI | Medium   | `validate.pug` scaffold exists           |
| Resume export improvements | Medium   | JSON, TXT, Markdown via `npm run export` |
| PWA / offline polish       | Low      | `manifest.json`, service worker present  |
| i18n (EN/FR)               | Low      | Legacy French docs to consolidate        |
| Automated wiki sync CI job | Low      | GitHub Action from `wiki/`               |

---

## Phase 4 — Platform & ops (2027)

| Item                             | Priority | Notes                                                 |
| -------------------------------- | -------- | ----------------------------------------------------- |
| Node.js 24 on GitHub Actions     | Medium   | Actions runner deprecation timeline                   |
| Remove unused Firebase client TS | Low      | `src/lib/firebase.ts`, `public/js/firebase-config.js` |
| Dependabot auto-merge policy     | Medium   | Reduce fork default-branch alerts                     |
| Custom domain + SSL docs         | Low      | Firebase custom domain guide                          |
| Analytics privacy review         | Low      | Google Analytics integration audit                    |

---

## Vision (long term)

- **Self-hosted resume platform** — one repo, static deploy, optional Node dev server
- **Recruiter-friendly tools** — analyzer, compare, API for integrations
- **Portfolio extensibility** — plugins or themes without forking core routing

---

## Version history

| Version                      | Theme                                                   |
| ---------------------------- | ------------------------------------------------------- |
| 3.6.2                        | Platform hardening, Express 5, Playwright, static build |
| 4.0.0                        | Multi-version resumes, analyzer, compare, API docs      |
| 3.6.2 (`working-messy-code`) | Minimal Firebase PDF host (2023-06-02 tag)              |
| 1.x                          | Initial Express + Jade CV host                          |

See [CHANGELOG.md](../CHANGELOG.md) for detailed release notes.  
See [project-history.md](project-history.md) and [releases/](releases/README.md) for the full timeline and tagged release documentation.
