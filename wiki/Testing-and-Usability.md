# Testing and Usability

Online-PDF-CV uses a two-layer testing strategy:

1. **Jest** — server logic, routes, utilities
2. **Playwright** — end-user usability across desktop and mobile viewports

## Run all tests

```bash
npm run test:all
```

This executes:

1. `npm test` — Jest
2. `npm run build` — static site generation
3. `npm run test:e2e` — Playwright (starts the server automatically)
4. `npm run test:e2e:artifacts` — copies screenshots/videos to documentation folders

## Jest

```bash
npm test
npm run test:coverage
```

Coverage targets core server files in `app.js`, `routes/`, and `utils/`.

OpenAPI contract tests:

```bash
npm run openapi:validate   # generate spec from JSDoc + Redocly lint
npm test -- __tests__/openapi.test.js __tests__/generate-openapi.test.js
npx playwright test e2e/openapi.spec.js
```

See [docs/openapi.md](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/openapi.md) for the full traceability index.

## Playwright

```bash
npm run test:e2e
npm run test:e2e:analyzer   # full /analyzer workflow (SEO, upload, VT, AI tabs, edge cases)
npm run test:e2e:ui      # interactive runner
npm run test:e2e:report  # HTML report with traces
```

Configuration: `playwright.config.js`

| Spec file                       | Scenarios                                                          |
| ------------------------------- | ------------------------------------------------------------------ |
| `e2e/usability.spec.js`         | Home, docs, basic analyzer, compare, navigation, API smoke         |
| `e2e/analyzer-workflow.spec.js` | Full analyzer path + edge cases (~24 scenarios × desktop + mobile) |
| `e2e/openapi.spec.js`           | OpenAPI YAML, Swagger UI shell, Try it out → Execute (GET/POST)    |

### Usability scenarios covered

| Scenario          | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| Home page         | PDF iframe, title, navigation                                   |
| API docs          | Endpoint documentation visible                                  |
| Analyzer (basic)  | Paste resume text, view scores                                  |
| Analyzer (full)   | Config API, upload, VT mock, tabs, AI toggle, drag-drop, errors |
| Compare           | Side-by-side PDF comparison                                     |
| Versions API      | JSON payload validation                                         |
| OpenAPI / Swagger | YAML spec, interactive docs, live API calls from Swagger UI     |
| PDF endpoints     | `/resume` and `/resume/default`                                 |
| Navigation flow   | Home → Docs → Analyzer → Compare → Home                         |

The `@live` analyzer test calls real OpenAI when `OPENAI_API_KEY` is set and skips if quota/billing blocks the API.

---

## Screenshots

Published copies live in the repository at `docs/assets/screenshots/`.

### Home page

![Home page](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/01-home-desktop.png)

### API documentation

![API docs](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/02-docs-page.png)

### Resume analyzer

| Before analysis                                                                                                                   | After analysis                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ![Analyzer input](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/03-analyzer-before.png) | ![Analyzer results](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/04-analyzer-results.png) |

### Resume comparison

| Version selectors                                                                                                                   | Side-by-side view                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ![Compare selectors](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/05-compare-before.png) | ![Compare view](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/06-compare-side-by-side.png) |

### Navigation flow

![Docs via navigation](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/08-nav-docs.png)

![Analyzer via navigation](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/09-nav-analyzer.png)

![Compare via navigation](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/10-nav-compare.png)

![Return to home](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/11-nav-home.png)

---

## Videos

Documentation videos are stored at `docs/assets/videos/` (WebM).

GitHub Wiki and the README link to these files. Download or open them locally after running `npm run test:all`.

| Video                                                                                                                       | Scenario          | Viewport |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------- |
| [home-desktop.webm](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/assets/videos/home-desktop.webm)             | Home page load    | Desktop  |
| [analyzer-desktop.webm](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/assets/videos/analyzer-desktop.webm)     | Analyzer workflow | Desktop  |
| [compare-desktop.webm](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/assets/videos/compare-desktop.webm)       | Compare tool      | Desktop  |
| [navigation-desktop.webm](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/assets/videos/navigation-desktop.webm) | Full navigation   | Desktop  |
| [home-mobile.webm](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/assets/videos/home-mobile.webm)               | Home page load    | Mobile   |
| [navigation-mobile.webm](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/assets/videos/navigation-mobile.webm)   | Full navigation   | Mobile   |

### Local artifact paths

After Playwright runs, raw artifacts are also available at:

- `e2e/artifacts/screenshots/`
- `e2e/artifacts/videos/`
- `playwright-report/` (HTML report)

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pull requests and `master`:

- Prettier check
- ESLint
- OpenAPI generate + Redocly lint (`openapi:generate`, `openapi:lint` inside `validate`)
- Jest with coverage
- Static build
- Playwright e2e (desktop + mobile, including analyzer workflow)
- Coverage upload (when `CODECOV_TOKEN` is configured)

## Related pages

- [[Development]]
- [[Troubleshooting]]
