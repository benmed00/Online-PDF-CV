# Be aware

Important cautions for developers, operators, and contributors.

---

## Security

### Path traversal

Resume version slugs **must** match `/^[a-z0-9-]+$/`. Never bypass `isValidVersion()` when adding new PDF delivery paths.

### Content Security Policy

Helmet CSP allows `'unsafe-inline'` for scripts and styles (required by inline Pug/analyzer UI). Do not widen `frameSrc` or `scriptSrc` to external domains without review.

### Secrets

| Never commit              | Use instead                                  |
| ------------------------- | -------------------------------------------- |
| `.env` files              | `.gitignore` + local env                     |
| Firebase service accounts | Firebase CLI login / CI secrets              |
| `CODECOV_TOKEN`           | GitHub repository secret                     |
| API keys in Functions     | Firebase Functions secrets / emulator `.env` |

### Production error pages

With `NODE_ENV=production`, stack traces are hidden from users but still logged server-side.

---

## External pull requests

Contributors without write access should fork the repository and open PRs against `benmed00/Online-PDF-CV` `master`. CI runs on same-repo PRs automatically via `.github/workflows/ci.yml`.

---

## Production deployment model

Firebase Hosting serves **static files** from `public/` after `npm run build`. There is no Express middleware on static routes.

| Capability              | Local (`npm start`) | Firebase Hosting only | Firebase + Cloud Functions |
| ----------------------- | ------------------- | --------------------- | -------------------------- |
| HTML pages (`/docs`, …) | Pug (dynamic)       | Pre-built HTML        | Pre-built HTML             |
| `GET /api/versions`     | Express             | Static JSON rewrite   | Static JSON rewrite        |
| `GET /api/openapi.yaml` | Express             | Static file           | Static file                |
| Analyzer POST APIs      | Express             | **Unavailable**       | Cloud Function `api`       |
| Swagger UI `/api/docs`  | Express             | **Unavailable**       | **Unavailable**            |

Analyzer UI on Firebase uses **client-side fallback** when the Cloud Function is not deployed or unreachable.

Always deploy hosting **and** functions for full analyzer features:

```bash
npm run build
firebase deploy --only functions,hosting
```

See [functions/README.md](../functions/README.md) and [wiki/Deployment.md](../wiki/Deployment.md).

---

## Build discipline

Deploying without `npm run build` causes:

- Missing or stale `/docs`, `/analyzer`, `/compare`, `/validate` pages
- Outdated `versions.json` or `openapi.yaml`
- Broken navigation on production

Always:

```bash
SITE_URL=https://your-domain.com npm run build
firebase deploy --only functions,hosting
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

| Context                | Version                                  |
| ---------------------- | ---------------------------------------- |
| `package.json` engines | ≥ 22.0.0                                 |
| `.nvmrc`               | 22                                       |
| Cloud Functions        | Node 22 (`functions/package.json`)       |
| CI                     | Node 22 (see `.github/workflows/ci.yml`) |

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
| `ben-git-code/Online-PDF-CV`                                          | Development mirror (optional remote)     |

Do not force-push to `master` without coordinating with open PRs.

---

## AI / Cursor agents and merges

**Incident (2026-06-08):** [PR #32](https://github.com/benmed00/Online-PDF-CV/pull/32) was merged to `master` while checks were failing without explicit maintainer approval.

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

Project rule: `.cursor/rules/merge-approval-required.mdc` (always applied in Cursor).
