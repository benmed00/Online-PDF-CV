# TODOs

Active short-term tasks. For the full prioritized queue see [backlog.md](backlog.md).

---

## Immediate (this sprint)

- [ ] **Merge PR #31** — [benmed00/Online-PDF-CV#31](https://github.com/benmed00/Online-PDF-CV/pull/31)
- [ ] **Merge `platform-hardening-and-docs` → `master`** on [benmed00/Online-PDF-CV](https://github.com/benmed00/Online-PDF-CV)
- [ ] **Create GitHub Project board** — run `gh auth refresh -s read:project,project`, then link issues #17–#30
- [x] **Canonical repo** — `benmed00/Online-PDF-CV` (Issues enabled)

---

## After merge to master

- [ ] Sync wiki per [wiki/Sync-Wiki.md](../wiki/Sync-Wiki.md)
- [ ] Verify Firebase production deploy for `/docs`, `/analyzer`, `/compare`
- [ ] Confirm `npm run test:all` green on `master`
- [ ] Close obsolete issues #25–#26 (upstream/fork tracking — no longer applicable)
- [ ] Close stale Snyk/Dependabot PRs superseded by Express 5 hardening

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
- [ ] Regenerate Playwright media after any UI change
- [ ] Bump patch version after merge if needed

---

_Last updated: 2026-06-07_
