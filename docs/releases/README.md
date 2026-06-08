# Releases

Index of tagged releases and major milestones for Online-PDF-CV.

**Live site:** [benyakoub-cv.firebaseapp.com](https://benyakoub-cv.firebaseapp.com/)

---

## Release index

| Tag / version                                                                                     | Date       | Theme                                           | Documentation                                                                         |
| ------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`working-messy-code`](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code) | 2023-06-02 | Minimal Firebase PDF host; Express layer broken | [Release notes](working-messy-code.md)                                                |
| 3.6.2 (maintenance)                                                                               | 2023–2024  | CV updates, dependency security patches         | [Project history](../project-history.md#phase-1--maintenance-only-oct-2023--jul-2024) |
| 4.0.0 (feature wave)                                                                              | 2025       | Analyzer, compare, docs, export, Jest           | [CHANGELOG](../../CHANGELOG.md)                                                       |
| 3.6.2 (platform hardening)                                                                        | 2026       | Express 5, static build, Playwright, wiki       | [Platform hardening](platform-hardening-v3.6.2.md)                                    |

For the full timeline — when refactors happened, why, and what changed — see [Project history](../project-history.md).

---

## Quick comparison

| Area            | `working-messy-code` (2023)                 | Current (2026)                                    |
| --------------- | ------------------------------------------- | ------------------------------------------------- |
| Files in repo   | 22                                          | ~260                                              |
| Production path | Firebase static `index.html` + embedded PDF | Pre-built Pug pages + Firebase rewrites           |
| Express routes  | Wildcard serves PDF for almost all paths    | Explicit routes for pages, API, PDFs              |
| Tools           | None                                        | `/docs`, `/analyzer`, `/compare`, `/api/versions` |
| Tests           | None                                        | Jest + Playwright                                 |
| Template engine | Jade (unused)                               | Pug                                               |

---

## Related documentation

| Document                                               | Purpose                               |
| ------------------------------------------------------ | ------------------------------------- |
| [Project history](../project-history.md)               | Full timeline and refactor objectives |
| [How it works](../how-it-works.md)                     | Current architecture                  |
| [Roadmap](../roadmap.md)                               | Planned work                          |
| [CHANGELOG](../../CHANGELOG.md)                        | Version-by-version notes              |
| [Wiki: Releases](../../wiki/Releases.md)               | GitHub Wiki–compatible release index  |
| [Wiki: Project History](../../wiki/Project-History.md) | GitHub Wiki–compatible history page   |

---

## Checking out a release locally

```bash
git fetch origin tag working-messy-code
git worktree add ../Online-PDF-CV-release working-messy-code
cd ../Online-PDF-CV-release
npm install
npm start
```

See [working-messy-code.md](working-messy-code.md) for expected local behaviour and known bugs at that tag.
