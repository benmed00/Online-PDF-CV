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

## External pull requests

Contributors without write access should fork the repository and open PRs against `benmed00/Online-PDF-CV` `master`. CI runs on same-repo PRs automatically via `.github/workflows/ci.yml`.

---

## Static hosting limitations

Firebase Hosting serves **static files only**:

- No server-side Pug rendering in production
- No Express middleware (Helmet, custom error pages) on Firebase — rely on pre-built HTML and CDN headers
- API routes are static files generated at build time (`/api/versions.json`, `/api/openapi.yaml`)

Dynamic features (e.g. `POST /api/analyze`) work on Express locally; on pure static Firebase, analyzer uses client-side logic or needs Cloud Functions (not currently deployed for analyzer).

---

## Build discipline

Deploying without `npm run build` causes:

- Missing or stale `/docs`, `/analyzer`, `/compare` pages
- Outdated `versions.json` or `openapi.yaml`
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

## Canonical repository

| Repo                                                                  | Role                                     |
| --------------------------------------------------------------------- | ---------------------------------------- |
| [`benmed00/Online-PDF-CV`](https://github.com/benmed00/Online-PDF-CV) | **Primary** — code, issues, CI, releases |
| `ben-git-code/Online-PDF-CV`                                          | Legacy mirror (optional remote `legacy`) |

Do not force-push to `master` without coordinating with open PRs.

---

## AI / Cursor agents and merges

**Incident (2026-06-08):** [PR #32](https://github.com/benmed00/Online-PDF-CV/pull/32) was merged to `master` while checks were failing (**1 of 7 passed**) without explicit maintainer approval. GitHub shows **Merged by `benmed00`** because the Cursor agent used local `gh`/`git` credentials — not because the maintainer clicked Merge in the UI.

**Rule for agents and humans:**

| Action                             | Requirement                                          |
| ---------------------------------- | ---------------------------------------------------- |
| Merge any PR to `master`           | Explicit written approval in the same conversation   |
| Push directly to `master`          | Same — never substitute "continue work" for approval |
| Mark a PR "ready to merge" in docs | Does not authorize merge                             |

**Repo guardrails (recommended on GitHub → Settings → Branches):**

- Require pull request before merging to `master`
- Require status checks to pass (`validate`, e2e jobs)
- Do not allow bypassing for admins until process is stable
- Disable auto-merge on the repo

Project rule: `.cursor/rules/merge-approval-required.mdc` (always applied in Cursor).
