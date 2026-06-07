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
npm run test:all       # test → build → e2e → publish artifacts
npm run lint           # ESLint
npm run format         # Prettier
```

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
