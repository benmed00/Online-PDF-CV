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

## Playwright

```bash
npm run test:e2e
npm run test:e2e:ui      # interactive runner
npm run test:e2e:report  # HTML report with traces
```

Configuration: `playwright.config.js`

Tests: `e2e/usability.spec.js`

### Usability scenarios covered

| Scenario | Description |
|----------|-------------|
| Home page | PDF iframe, title, navigation |
| API docs | Endpoint documentation visible |
| Analyzer | Paste resume text, view scores |
| Compare | Side-by-side PDF comparison |
| Versions API | JSON payload validation |
| PDF endpoints | `/resume` and `/resume/default` |
| Navigation flow | Home → Docs → Analyzer → Compare → Home |

---

## Screenshots

Published copies live in the repository at `docs/assets/screenshots/`.

### Home page

![Home page](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/01-home-desktop.png)

### API documentation

![API docs](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/02-docs-page.png)

### Resume analyzer

| Before analysis | After analysis |
|-----------------|----------------|
| ![Analyzer input](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/03-analyzer-before.png) | ![Analyzer results](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/04-analyzer-results.png) |

### Resume comparison

| Version selectors | Side-by-side view |
|-------------------|-------------------|
| ![Compare selectors](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/05-compare-before.png) | ![Compare view](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/06-compare-side-by-side.png) |

### Navigation flow

![Docs via navigation](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/08-nav-docs.png)

![Analyzer via navigation](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/09-nav-analyzer.png)

![Compare via navigation](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/10-nav-compare.png)

![Return to home](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/11-nav-home.png)

---

## Videos

Documentation videos are stored at `docs/assets/videos/` (WebM).

GitHub Wiki and the README link to these files. Download or open them locally after running `npm run test:all`.

| Video | Scenario | Viewport |
|-------|----------|----------|
| [home-desktop.webm](https://github.com/ben-git-code/Online-PDF-CV/blob/master/docs/assets/videos/home-desktop.webm) | Home page load | Desktop |
| [analyzer-desktop.webm](https://github.com/ben-git-code/Online-PDF-CV/blob/master/docs/assets/videos/analyzer-desktop.webm) | Analyzer workflow | Desktop |
| [compare-desktop.webm](https://github.com/ben-git-code/Online-PDF-CV/blob/master/docs/assets/videos/compare-desktop.webm) | Compare tool | Desktop |
| [navigation-desktop.webm](https://github.com/ben-git-code/Online-PDF-CV/blob/master/docs/assets/videos/navigation-desktop.webm) | Full navigation | Desktop |
| [home-mobile.webm](https://github.com/ben-git-code/Online-PDF-CV/blob/master/docs/assets/videos/home-mobile.webm) | Home page load | Mobile |
| [navigation-mobile.webm](https://github.com/ben-git-code/Online-PDF-CV/blob/master/docs/assets/videos/navigation-mobile.webm) | Full navigation | Mobile |

### Local artifact paths

After Playwright runs, raw artifacts are also available at:

- `e2e/artifacts/screenshots/`
- `e2e/artifacts/videos/`
- `playwright-report/` (HTML report)

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on `master`:

- Prettier check
- ESLint
- Jest
- Static build
- Coverage upload

Add Playwright to CI by extending the workflow with `npx playwright install chromium` and `npm run test:e2e`.

## Related pages

- [[Development]]
- [[Troubleshooting]]
