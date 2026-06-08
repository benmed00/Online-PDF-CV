# Scheduled maintenance

Recurring upkeep calendar for Online-PDF-CV operators and maintainers.

---

## Weekly

| Task             | Command / action                                                                                           | Owner      |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| Verify live site | Open [benyakoub-cv.firebaseapp.com](https://benyakoub-cv.firebaseapp.com/) — home, docs, analyzer, compare | Operator   |
| Check fork CI    | Review [Actions → CI](https://github.com/benmed00/Online-PDF-CV/actions/workflows/ci.yml) on active branch | Maintainer |
| Review open PRs  | Triage upstream PR #3 and fork issues #25–#30                                                              | Maintainer |

---

## Bi-weekly

| Task             | Command / action                                       | Notes                                |
| ---------------- | ------------------------------------------------------ | ------------------------------------ |
| Dependency audit | `npm audit`                                            | Fix high/critical before next deploy |
| Lint + format    | `npm run format:check && npm run lint`                 | Catch drift early                    |
| Log review       | Inspect `logs/error.log` on any long-running Node host | N/A for Firebase-only                |

---

## Monthly

| Task                  | Command / action                                                   | Notes                                  |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| Full test suite       | `npm run test:all`                                                 | Includes e2e + media regeneration      |
| Update resume content | Replace PDFs in `public/` as needed                                | Rebuild + redeploy                     |
| Sitemap refresh       | `npm run generate-sitemap -- https://benyakoub-cv.firebaseapp.com` | SEO                                    |
| Review Dependabot     | GitHub Security tab on fork and upstream                           | See [known-issues.md](known-issues.md) |
| Sync documentation    | Align `docs/`, `wiki/`, README if features changed                 |                                        |

---

## Quarterly

| Task                      | Notes                                                        |
| ------------------------- | ------------------------------------------------------------ |
| Node.js LTS review        | Align `engines`, CI matrix, local dev                        |
| Firebase CLI update       | `npm i -g firebase-tools@latest`                             |
| Playwright browser update | `npx playwright install` after `@playwright/test` bump       |
| Roadmap review            | Update [roadmap.md](roadmap.md) and [backlog.md](backlog.md) |
| Security policy review    | [SECURITY.md](../SECURITY.md) supported versions             |

---

## Per release (v3.6.x → next)

| Step | Action                                                  |
| ---- | ------------------------------------------------------- |
| 1    | Close resolved issues; open new milestone               |
| 2    | Update `CHANGELOG.md` and `package.json` version        |
| 3    | Run `npm run test:all` on release branch                |
| 4    | `npm run build` with production `SITE_URL`              |
| 5    | `firebase deploy` or merge to trigger CI deploy         |
| 6    | Tag release: `git tag v3.x.x && git push origin v3.x.x` |
| 7    | Sync GitHub Wiki from `wiki/`                           |
| 8    | Regenerate and commit Playwright media if UI changed    |

---

## CI maintenance

| Item                             | Frequency        | Detail                                                |
| -------------------------------- | ---------------- | ----------------------------------------------------- |
| Actions runner Node version      | Before June 2026 | Migrate to Node 24 per GitHub deprecation notice      |
| `actions/checkout`, `setup-node` | Quarterly        | Bump to latest v4+                                    |
| Codecov token                    | Once             | Add `CODECOV_TOKEN` secret if coverage uploads needed |
| Playwright artifact retention    | Automatic        | GitHub Actions artifact expiry (default 90 days)      |

---

## Firebase Hosting

| Item               | Frequency                    | Detail                                      |
| ------------------ | ---------------------------- | ------------------------------------------- |
| SSL certificate    | Automatic                    | Firebase-managed                            |
| Custom domain DNS  | As needed                    | Verify CNAME if domain added                |
| Hosting bandwidth  | Monthly review               | Firebase console usage tab                  |
| Rewrite rules test | After `firebase.json` change | Hit `/resume`, `/api/versions` on live site |

---

## Backup checklist

| Asset               | Location                               | Backup method                     |
| ------------------- | -------------------------------------- | --------------------------------- |
| Resume PDFs         | `public/resume.pdf`, `public/resumes/` | Git + local copy                  |
| Firebase config     | `firebase.json`, `.firebaserc`         | Git                               |
| Environment secrets | Not in git                             | Password manager / GitHub Secrets |
| Wiki content        | `wiki/`                                | Git; optional GitHub Wiki clone   |

---

## Maintenance log template

Record significant maintenance in CHANGELOG or a release note:

```markdown
## Maintenance YYYY-MM-DD

- npm audit: X vulnerabilities → 0
- Deployed v3.x.x to Firebase
- Regenerated Playwright media
- Updated dependency: express x.y.z
```

---

_Next scheduled review: 2026-07-01 (post v3.6.2 merge target)_
