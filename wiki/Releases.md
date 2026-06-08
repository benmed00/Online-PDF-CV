# Releases

Index of tagged releases and major milestones.

**Maintainer docs:** [docs/releases/](https://github.com/benmed00/Online-PDF-CV/tree/master/docs/releases)

---

## Release index

| Tag / version                                                                                     | Date       | Theme                                       | Details                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`working-messy-code`](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code) | 2023-06-02 | Minimal Firebase PDF host                   | [Release notes](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/working-messy-code.md) · [Archive branch](https://github.com/benmed00/Online-PDF-CV/tree/archive/first-release-working-messy-code) |
| 3.6.2 maintenance                                                                                 | 2023–2024  | CV updates, security patches                | [[Project-History#phase-1--maintenance-oct-2023--jul-2024]]                                                                                                                                                            |
| 4.0.0 feature wave                                                                                | 2025       | Analyzer, compare, docs, Jest               | [CHANGELOG](https://github.com/benmed00/Online-PDF-CV/blob/master/CHANGELOG.md)                                                                                                                                        |
| 4.1.0 analyzer & quality                                                                          | 2026-06    | Upload/OCR/AI analyzer, Husky, version sync | [CHANGELOG](https://github.com/benmed00/Online-PDF-CV/blob/master/CHANGELOG.md)                                                                                                                                        |
| 4.0.0 platform hardening (`v4.0.0`)                                                               | 2026-06    | Express 5, static build, Playwright         | [Release notes](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/platform-hardening-v3.6.2.md)                                                                                                      |

For the full timeline see [[Project-History]].

---

## `working-messy-code` (2023-06-02)

The last snapshot of the original minimal app before the refactor.

| Metric       | Value                          |
| ------------ | ------------------------------ |
| Commit       | `1bddfbc`                      |
| Files        | 22                             |
| Dependencies | 6 (Express 4, Jade, Morgan, …) |
| Tests        | None                           |

**Production:** Firebase Hosting served `public/index.html` with an embedded PDF.  
**Express (local):** Broken — wildcard route returned PDF for `/docs`, `/api/*`, and all other paths.

### Archive branch

Long-lived ref for browsing and worktrees (same tree as the tag):

**Branch:** [`archive/first-release-working-messy-code`](https://github.com/benmed00/Online-PDF-CV/tree/archive/first-release-working-messy-code)  
**Commit:** `1bddfbc` (2023-06-02)

### Run locally

```bash
git fetch origin archive/first-release-working-messy-code
git worktree add ../Online-PDF-CV-release archive/first-release-working-messy-code
cd ../Online-PDF-CV-release
npm install && npm start
```

Home page works; other paths return the PDF file.

Full documentation: [docs/releases/working-messy-code.md](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/working-messy-code.md) · [Archive branches](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/archive-branches.md)

---

## Platform hardening v3.6.2 (2026)

Merged via [PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31).

**Delivered:**

- Express 5 with explicit routing and security (Helmet, slug validation)
- Static build (`npm run build`) for Firebase Hosting
- Resume tools: `/docs`, `/analyzer`, `/compare`, `/api/versions`
- 22 Jest + 14 Playwright tests with screenshot/video capture
- Documentation: README media, `wiki/`, `docs/` maintainer hub

Full documentation: [docs/releases/platform-hardening-v3.6.2.md](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/releases/platform-hardening-v3.6.2.md)

---

## Quick comparison

| Area                | `working-messy-code` | Current                    |
| ------------------- | -------------------- | -------------------------- |
| Files               | 22                   | ~260                       |
| `GET /docs`         | PDF (bug)            | HTML docs page             |
| `GET /api/versions` | PDF (bug)            | JSON                       |
| Firebase deploy     | Static index only    | Pre-built pages + rewrites |
| Tests               | 0                    | Jest + Playwright          |

---

## Related pages

| Page                                                                            | Topic                                 |
| ------------------------------------------------------------------------------- | ------------------------------------- |
| [[Project-History]]                                                             | Full timeline and refactor objectives |
| [[Development]]                                                                 | Current local workflow                |
| [[Deployment]]                                                                  | Firebase deploy with static build     |
| [[Testing-and-Usability]]                                                       | Playwright suite                      |
| [CHANGELOG](https://github.com/benmed00/Online-PDF-CV/blob/master/CHANGELOG.md) | Detailed version notes                |
