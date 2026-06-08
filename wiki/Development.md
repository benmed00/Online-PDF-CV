# Development

## Project layout

| Path         | Purpose                          |
| ------------ | -------------------------------- |
| `app.js`     | Express application and routes   |
| `bin/www`    | HTTP server entrypoint           |
| `routes/`    | Page routers                     |
| `views/`     | Pug templates                    |
| `utils/`     | Logging, errors, resume helpers  |
| `public/`    | Static assets and generated HTML |
| `scripts/`   | CLI utilities and static build   |
| `e2e/`       | Playwright usability tests       |
| `__tests__/` | Jest unit/integration tests      |

## Common scripts

```bash
npm start              # Start server via bin/www
npm run dev            # Start server via app.js
npm run build          # Pre-render Pug views for Firebase
npm test               # Jest unit tests
npm run test:coverage  # Jest with coverage thresholds
npm run test:e2e       # Playwright usability tests
npm run validate       # CI build job parity (format, lint, audit, coverage, build)
npm run validate:full  # validate + Playwright e2e
npm run test:all       # validate:full + publish e2e media to docs/assets/
npm run lint           # ESLint
npm run format         # Prettier
```

Husky runs **pre-commit** (format + lint), **commit-msg** (conventional commits), and **pre-push** (`validate`) automatically after `npm install`.

## Architecture

### Local development (Express)

Express renders Pug templates dynamically and serves PDFs from `public/`.

### Production (Firebase Hosting)

Firebase serves static files from `public/`. Run `npm run build` before deploy to generate:

- `public/index.html`
- `public/docs/index.html`
- `public/analyzer/index.html`
- `public/compare/index.html`
- `public/api/versions.json`

Firebase rewrites map `/resume/:version` to PDF files.

## Environment variables

| Variable   | Purpose                               |
| ---------- | ------------------------------------- |
| `PORT`     | Server port (default `3000`)          |
| `NODE_ENV` | `development` or `production`         |
| `SITE_URL` | Canonical URL used by `npm run build` |

Example:

```bash
SITE_URL=https://yourdomain.com npm run build
```

## Logging

Winston writes to:

- console
- `logs/error.log`
- `logs/all.log`

## Error handling

- API routes return JSON errors
- Browser routes render `views/error.pug`
- Operational errors use `AppError`

## Related pages

- [[Testing-and-Usability]]
- [[Deployment]]
- [[API-Reference]]
- [[Project-History]]
- [[Releases]]
- [Maintainer docs — how it works](https://github.com/benmed00/Online-PDF-CV/blob/master/docs/how-it-works.md)
