# Project History

Timeline of Online-PDF-CV from the initial Express PDF host through the platform hardening refactor.

**Maintainer deep-dive:** [docs/project-history.md](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/project-history.md)

---

## Overview

| Era                 | Dates               | What it was                                |
| ------------------- | ------------------- | ------------------------------------------ |
| Origins             | 2019–2023           | Minimal Express + Firebase static PDF host |
| Dormant maintenance | Oct 2023 – Jul 2024 | CV updates only, no architecture change    |
| First refactor      | Aug 2025            | Fixed broken Express; Jade → Pug; Helmet   |
| Platform build-out  | 2025–2026           | Analyzer, compare, docs, API, Jest         |
| Platform hardening  | Jun 2026            | Express 5, static build, Playwright, wiki  |
| Analyzer+           | 2026                | File upload, VirusTotal, OpenAI coach      |

---

## The `working-messy-code` release (2023-06-02)

The [last tagged snapshot](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code) before the major refactor:

- **22 files**, 6 npm dependencies
- Production worked via **Firebase Hosting** — static `index.html` embedding `resume.pdf`
- Express server was **broken**: unmounted routers, wildcard route returning PDF for every path
- Tag name = honest assessment: _works on Firebase, messy in code_

Full release notes: [[Releases#working-messy-code]] and [docs/releases/working-messy-code.md](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/working-messy-code.md).

---

## Why the refactor happened

Three layered objectives:

### 1. Fix broken foundations

The release-era Express layer served PDF for almost every route. Routers were imported but never mounted. The first refactor ([fork PR #1](https://github.com/ben-git-code/Online-PDF-CV/pull/1), Aug 2025) removed the wildcard, mounted routes, and migrated Jade → Pug.

### 2. Evolve from PDF host to resume platform

Added multi-version resumes, API docs, analyzer, compare tool, export scripts, and SEO utilities. See [[API-Reference]] and [[Development]].

### 3. Production readiness

[PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31) (Jun 2026) delivered Express 5, static Firebase build, Winston logging, Helmet security, Jest + Playwright tests, and full documentation.

---

## Phase timeline

### Phase 0 — Origins (2019–2023)

Initial Express app to host a PDF CV. Heroku references in early README; later moved to Firebase Hosting.

### Phase 1 — Maintenance (Oct 2023 – Jul 2024)

CV content updates, README fixes, Snyk security PRs. Architecture unchanged.

### Phase 2 — First refactor (Aug 2025)

- Remove `app.get('*')` PDF wildcard
- Mount routers; add Helmet
- Jade → Pug; ES6 style

### Phase 3 — Platform build-out (2025–2026)

Major feature commit added `/docs`, `/analyzer`, `/compare`, `/api/versions`, Jest, ESLint, export scripts, PWA scaffolding.

### Phase 4 — Platform hardening (Jun 2026)

Merged PR #31: Express 5, `npm run build` for Firebase, 22 Jest + 14 Playwright tests, README media, `wiki/` and `docs/` hubs.

Details: [platform-hardening release notes](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/platform-hardening-v3.6.2.md).

### Phase 5 — Analyzer enhancements (2026)

File upload (Word, PDF, images), VirusTotal malware scan, OpenAI AI Coach tab. Requires optional API keys — see [[Getting-Started#environment-variables]].

---

## Before vs after

| Route           | `working-messy-code`       | Current                  |
| --------------- | -------------------------- | ------------------------ |
| `/`             | Static HTML + embedded PDF | Pug home with navigation |
| `/docs`         | Returns PDF (bug)          | API documentation page   |
| `/analyzer`     | Returns PDF (bug)          | Resume analyzer tool     |
| `/api/versions` | Returns PDF (bug)          | JSON version list        |

---

## Fork and upstream

| Repository                                                                  | Role                              |
| --------------------------------------------------------------------------- | --------------------------------- |
| [benmed00/Online-PDF-CV](https://github.com/benmed00/Online-PDF-CV)         | Canonical upstream; live deploy   |
| [ben-git-code/Online-PDF-CV](https://github.com/ben-git-code/Online-PDF-CV) | Development fork; refactor origin |

---

## Related pages

| Page                                                                                    | Topic                            |
| --------------------------------------------------------------------------------------- | -------------------------------- |
| [[Releases]]                                                                            | Tagged releases index            |
| [[Development]]                                                                         | Current architecture and scripts |
| [[Deployment]]                                                                          | Firebase static build            |
| [[Testing-and-Usability]]                                                               | Playwright media and test suite  |
| [Roadmap (docs)](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/roadmap.md) | Future phases                    |
| [CHANGELOG](https://github.com/benmed00/Online-PDF-CV/blob/master/CHANGELOG.md)         | Version notes                    |
