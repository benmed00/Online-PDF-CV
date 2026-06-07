# Be aware

Important cautions for developers, operators, and contributors.

---

## Security

### Path traversal

Resume version slugs **must** match `/^[a-z0-9-]+$/`. Never bypass `isValidVersion()` when adding new PDF delivery paths.

### Content Security Policy

Helmet CSP allows `'unsafe-inline'` for scripts and styles (required by inline Pug/analyzer UI). Do not widen `frameSrc` or `scriptSrc` to external domains without review.

### Secrets

| Never commit              | Use instead                     |
| ------------------------- | ------------------------------- |
| `.env` files              | `.gitignore` + local env        |
| Firebase service accounts | Firebase CLI login / CI secrets |
| `CODECOV_TOKEN`           | GitHub repository secret        |

### Production error pages

With `NODE_ENV=production`, stack traces are hidden from users but still logged server-side.

---

## Fork pull requests

### Untrusted workflow code

Upstream maintainers must explicitly **allow workflows from fork PRs** before CI runs on external contributions. This is a security trade-off — review workflow changes in PR diffs before enabling.

### Firebase preview deploy

Preview channels **do not run** for fork PRs (`head.repo != github.repository`). Do not expect a Firebase preview URL on upstream PR #3.

---

## Static hosting limitations

Firebase Hosting serves **static files only**:

- No server-side Pug rendering in production
- No Express middleware (Helmet, custom error pages) on Firebase — rely on pre-built HTML and CDN headers
- API routes are static JSON files generated at build time (`/api/versions.json`)

Dynamic features (e.g. `POST /api/analyze`) work on Express locally; on pure static Firebase, analyzer uses client-side logic or needs Cloud Functions (not currently deployed for analyzer).

---

## Build discipline

Deploying without `npm run build` causes:

- Missing or stale `/docs`, `/analyzer`, `/compare` pages
- Outdated `versions.json`
- Broken navigation on production

Always:

```bash
SITE_URL=https://your-domain.com npm run build
firebase deploy
```

---

## Logs directory

`logs/` is gitignored and grows on long-running servers. Rotate or truncate periodically in production VMs (not applicable to Firebase static hosting).

---

## Resume PDF caching

Firebase sets `Cache-Control: public, max-age=3600` on PDFs. After updating a PDF, users may see cached version for up to **1 hour**.

---

## GitHub metadata script

`scripts/setup-github-metadata.js` creates issues on **`benmed00/Online-PDF-CV` only**. It requires `gh` CLI authenticated with issue write access. Do not run against upstream without permission.

---

## Node.js version

| Context                    | Version                               |
| -------------------------- | ------------------------------------- |
| `package.json` engines     | ≥ 16.17.1                             |
| CI (PR / feature branch)   | 20.x                                  |
| CI (master push)           | 16.x, 18.x, 20.x matrix               |
| GitHub Actions deprecation | Node 20 actions → Node 24 by mid-2026 |

---

## Media assets in git

Screenshots and WebM files in `docs/assets/` are **intentionally committed** for README/wiki embedding. They increase repo size — regenerate only when UI changes, not on every test run unless publishing docs.

---

## License & attribution

Project is **Apache-2.0**. Preserve license headers when copying utilities. Author metadata: Jacob Son — see [package.json](../package.json).

---

## Upstream vs fork

| Repo                         | Access                     | Purpose                           |
| ---------------------------- | -------------------------- | --------------------------------- |
| `ben-git-code/Online-PDF-CV` | Read-only for contributors | Canonical upstream                |
| `benmed00/Online-PDF-CV`     | Admin for fork owner       | PR source, issue tracker, CI runs |

Do not force-push to upstream `master`.
