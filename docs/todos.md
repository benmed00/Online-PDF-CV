# TODOs

Active short-term tasks. For the full prioritized queue see [backlog.md](backlog.md).

---

## Immediate (this sprint)

- [x] **Create GitHub Project board** — [Project #7](https://github.com/users/benmed00/projects/7) (issues #13–#30 + PR #32)
- [x] **Canonical repo** — `benmed00/Online-PDF-CV` (Issues enabled)
- [x] **Merge PR #32** — merged to `master` 2026-06-08 ([#32](https://github.com/benmed00/Online-PDF-CV/pull/32))
- [x] **Analyzer Playwright workflow** — `e2e/analyzer-workflow.spec.js` + `npm run test:e2e:analyzer`

---

## After merge to master

- [ ] Sync wiki per [wiki/Sync-Wiki.md](../wiki/Sync-Wiki.md)
- [ ] Verify Firebase production deploy for `/docs`, `/analyzer`, `/compare`
- [ ] Confirm `npm run test:all` green on `master`
- [ ] Close obsolete issues #25–#26 (upstream/fork tracking — no longer applicable)
- [x] Close stale Snyk/Dependabot PRs #3–#16 (superseded by merged #32 / Express 5)
- [ ] **OpenAI billing** — restore AI Coach when quota is available (key valid; 429 quota as of 2026-06-08)

---

## Documentation

- [x] Add maintainer docs under `docs/` (roadmap, backlog, how-it-works, …)
- [x] Link `docs/` index from root README
- [x] Point clone URLs and metadata to `benmed00/Online-PDF-CV`
- [ ] Retire or redirect outdated French content in old docs pages

---

## CI / quality

- [x] Fix Prettier gate on CI
- [x] Fix ESLint errors in Playwright config and metadata script
- [x] Green CI on `platform-hardening-and-docs` (build + e2e)
- [x] Husky pre-commit / commit-msg / pre-push hooks + `validate` script
- [x] `npm audit --audit-level=high` in `validate`
- [x] Dependabot for npm + GitHub Actions (`.github/dependabot.yml`)
- [x] Build script auto-formats static outputs with Prettier
- [x] Version sync script + merge workflow (`.github/workflows/release-version.yml`)
- [ ] Add `CODECOV_TOKEN` secret on repository
- [ ] Plan Node 24 migration for GitHub Actions (deprecation June 2026)

---

## Product

- [ ] Implement Firebase fallback for missing version PDFs ([#27](https://github.com/benmed00/Online-PDF-CV/issues/27))
- [ ] Decide fate of unused Firebase client files ([#29](https://github.com/benmed00/Online-PDF-CV/issues/29))
- [ ] Wire job-description validation UI if `validate.pug` is kept

---

## Housekeeping

- [ ] Review Dependabot alerts on `master` after merge
- [ ] Regenerate Playwright media after any UI change (`npm run test:all`)

_Last updated: 2026-06-08_
