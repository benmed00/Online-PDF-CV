# Online-PDF-CV

Host a PDF resume online with **Express 5**, **Firebase Hosting**, multi-version delivery, API docs, and analysis tools.

**Live** · [benyakoub-cv.firebaseapp.com](https://benyakoub-cv.firebaseapp.com/)  
**Guides** · [Wiki home](wiki/Home.md) · [Getting started](wiki/Getting-Started.md) · [API reference](wiki/API-Reference.md)  
**Maintainers** · [docs/](docs/README.md) · [CHANGELOG](CHANGELOG.md) · v`4.1.0`

---

## Quick start

```bash
git clone https://github.com/benmed00/Online-PDF-CV.git
cd Online-PDF-CV
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Replace `public/resume.pdf`, add slugs under `public/resumes/`, or run:

```bash
npm run add-version -- /path/to/file.pdf technical
```

Deploy: `npm run build` → `npm run deploy` ([details](wiki/Deployment.md)).

---

## What you get

| Route               | Purpose                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `/`                 | Home — embedded PDF + navigation                                           |
| `/resume/:version`  | Versioned PDF (`technical`, `executive`, …)                                |
| `/api/versions`     | JSON list of available versions                                            |
| `/api/openapi.yaml` | OpenAPI 3.1 spec (JSDoc-generated; see [docs/openapi.md](docs/openapi.md)) |
| `/api/docs`         | Swagger UI (Express server only)                                           |
| `/docs`             | Human-readable API documentation                                           |
| `/analyzer`         | Keyword scoring, upload extraction, optional VirusTotal + OpenAI coach     |
| `/compare`          | Side-by-side PDF comparison                                                |

**Stack:** Node.js · Express 5 · Pug · Firebase · Jest · Playwright · Winston · Helmet

**Quality:** Husky hooks · CI (`validate` + e2e) · `npm audit` gate · Conventional commits

---

## Common commands

| Command               | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `npm start`           | Run server                                    |
| `npm run build`       | Pre-render static HTML for Firebase           |
| `npm run validate`    | Format, lint, audit, tests, build (CI parity) |
| `npm run test:all`    | Full pipeline + refresh Playwright media      |
| `npm run deploy`      | `firebase deploy`                             |
| `npm run add-version` | Add a resume PDF slug                         |

Full script list: [docs/how-to-use.md](docs/how-to-use.md).

<details>
<summary><strong>Analyzer API keys</strong> (optional — Express / local only)</summary>

Copy `.env.example` → `.env`:

| Variable             | Purpose                               |
| -------------------- | ------------------------------------- |
| `VIRUSTOTAL_API_KEY` | Malware scan on uploads               |
| `OPENAI_API_KEY`     | AI Coach tab (ATS tips, improvements) |

Restart after edits. Never commit `.env`.

**Firebase vs Express:** [Production analyzer](https://benyakoub-cv.firebaseapp.com/analyzer) uses **client-side scoring only**. Run `npm start` locally for upload → VirusTotal → extract → AI Coach.

</details>

---

## Documentation

| Link                                                 | For                                      |
| ---------------------------------------------------- | ---------------------------------------- |
| [Getting started](wiki/Getting-Started.md)           | Install, first deploy                    |
| [Deployment](wiki/Deployment.md)                     | Firebase rewrites & CI                   |
| [Testing & usability](wiki/Testing-and-Usability.md) | Jest, Playwright, media                  |
| [Troubleshooting](wiki/Troubleshooting.md)           | Common issues                            |
| [docs/ hub](docs/README.md)                          | Roadmap, backlog, architecture, releases |
| [Project history](docs/project-history.md)           | Refactor timeline                        |
| [Contributing](CONTRIBUTING.md)                      | Hooks, PR workflow                       |

---

## Contributing

1. Fork → feature branch → `npm run validate` (or `npm run test:all` before PR)
2. Conventional commits (`feat:`, `fix:`, `docs:`, …)
3. Open a PR against `master`

Apache-2.0 — see [LICENSE](LICENSE). **Jacob Son** — [ben94med@gmail.com](mailto:ben94med@gmail.com)

---

<details>
<summary><strong>Screenshots</strong> — Playwright captures (click to expand)</summary>

<p align="center">
  <a href="docs/assets/screenshots/01-home-desktop.png"><img src="docs/assets/screenshots/01-home-desktop.png" width="360" alt="Home — PDF viewer" /></a>
  <a href="docs/assets/screenshots/02-docs-page.png"><img src="docs/assets/screenshots/02-docs-page.png" width="360" alt="API docs" /></a>
</p>
<p align="center">
  <a href="docs/assets/screenshots/03-analyzer-before.png"><img src="docs/assets/screenshots/03-analyzer-before.png" width="240" alt="Analyzer input" /></a>
  <a href="docs/assets/screenshots/04-analyzer-results.png"><img src="docs/assets/screenshots/04-analyzer-results.png" width="240" alt="Analyzer results" /></a>
  <a href="docs/assets/screenshots/06-compare-side-by-side.png"><img src="docs/assets/screenshots/06-compare-side-by-side.png" width="240" alt="Compare tool" /></a>
</p>

[Full gallery →](docs/assets/GALLERY.md) · Regenerate: `npm run test:all`

</details>

<details>
<summary><strong>Usability videos</strong> (WebM)</summary>

| Clip                                                                  | Description         |
| --------------------------------------------------------------------- | ------------------- |
| [home-desktop.webm](docs/assets/videos/home-desktop.webm)             | Home (desktop)      |
| [analyzer-desktop.webm](docs/assets/videos/analyzer-desktop.webm)     | Analyzer workflow   |
| [compare-desktop.webm](docs/assets/videos/compare-desktop.webm)       | Compare tool        |
| [navigation-desktop.webm](docs/assets/videos/navigation-desktop.webm) | Navigation tour     |
| [home-mobile.webm](docs/assets/videos/home-mobile.webm)               | Home (mobile)       |
| [navigation-mobile.webm](docs/assets/videos/navigation-mobile.webm)   | Navigation (mobile) |

</details>
