# Best practices

Conventions for developing and maintaining Online-PDF-CV.

---

## Development workflow

1. **Branch from `master`** (or the active release branch) with a descriptive name: `feature/`, `fix/`, `docs/`.
2. **Run locally** before committing:
   ```bash
   npm run format:check && npm run lint && npm test
   ```
3. **Full gate before PR:**
   ```bash
   npm run test:all
   ```
4. **One concern per commit** — infrastructure, features, tests, and docs in separate commits when possible.
5. **Never commit secrets** — `.env`, Firebase keys, tokens. Use environment variables and GitHub Secrets for CI.

---

## Code style

| Tool     | Command          | Notes                                                                                         |
| -------- | ---------------- | --------------------------------------------------------------------------------------------- |
| Prettier | `npm run format` | CI fails on `format:check`                                                                    |
| ESLint   | `npm run lint`   | Warnings on `console.log` in `app.js` startup banner are acceptable; avoid new ones elsewhere |

Match existing patterns:

- CommonJS (`require` / `module.exports`) in server code
- Pug for views; pre-render with `npm run build` for Firebase
- Operational errors → `AppError`; pass to `next(err)`

---

## Security

| Practice                                         | Why                                             |
| ------------------------------------------------ | ----------------------------------------------- |
| Validate resume version slugs (`/^[a-z0-9-]+$/`) | Prevents path traversal on `/resume/:version`   |
| Keep Helmet CSP enabled                          | Limits XSS and iframe abuse                     |
| Do not expose stack traces in production         | Set `NODE_ENV=production`                       |
| Run `npm audit` monthly                          | Track dependency vulnerabilities                |
| Sanitize user input in analyzer API              | Text-only analysis; reject invalid `targetRole` |

---

## Resume content

| Practice                              | Detail                                      |
| ------------------------------------- | ------------------------------------------- |
| Use lowercase slugs                   | `technical`, not `Technical`                |
| One PDF per slug                      | `public/resumes/{slug}.pdf`                 |
| Keep `resume.pdf` as default fallback | Required for home page and Express fallback |
| Optimize PDF size                     | Faster load on mobile; aim under 2 MB       |

---

## Static build & deploy

Always run **`npm run build`** before `firebase deploy`:

```bash
SITE_URL=https://your-production-domain.com npm run build
npm run deploy
```

Without build, Firebase serves stale or missing HTML for `/docs`, `/analyzer`, `/compare`.

---

## Testing

| Layer          | Guideline                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Jest**       | Add tests for new routes, utils, and build scripts. Keep e2e out of Jest (`jest.config.js` ignores `/e2e/`).         |
| **Playwright** | Use `getByRole('main')` for headings when layout has duplicates. Prefer `request.get()` for PDF download assertions. |
| **Coverage**   | Core modules in `utils/`, `routes/`, `app.js` — maintain thresholds defined in `jest.config.js`.                     |
| **Media**      | Regenerate `docs/assets/` after UI changes via `npm run test:all`.                                                   |

---

## Git & GitHub

| Practice             | Detail                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Conventional commits | `feat:`, `fix:`, `docs:`, `ci:`, `test:`, `chore:`                                       |
| Link issues          | Reference fork/upstream issue numbers in PR descriptions                                 |
| Fork PRs             | CI runs on fork; upstream checks need maintainer config (see [be-aware.md](be-aware.md)) |
| Labels               | Use `type:`, `priority:`, `area:` labels on fork tracker                                 |

---

## Documentation

| When                | Update                                          |
| ------------------- | ----------------------------------------------- |
| New route or API    | `wiki/API-Reference.md`, `docs/how-it-works.md` |
| New script          | `docs/how-to-use.md`, README                    |
| Known bug           | `docs/known-issues.md`                          |
| Planned work        | `docs/backlog.md`, `docs/roadmap.md`            |
| Operational caution | `docs/be-aware.md`                              |

Keep `docs/` (maintainer reference) and `wiki/` (user-facing guides) in sync where topics overlap.

---

## Performance

- PDF `Cache-Control`: 1 hour on Firebase (`firebase.json` headers)
- Static middleware `{ index: false }` — prevents `public/index.html` from hijacking `/` in Express
- Playwright: single worker locally; retries enabled in CI only

---

## What to avoid

- Express 4 patterns removed in Express 5 (`app.all('*')`, optional route params like `:version?`)
- Committing `logs/*.log` or `node_modules/`
- Hardcoding production URLs outside `SITE_URL` / build script
- Skipping `npm run build` before deploy
- Using numeric separators (`60_000`) in files parsed by older ESLint configs
