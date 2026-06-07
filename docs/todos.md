# TODOs

Active short-term tasks. For the full prioritized queue see [backlog.md](backlog.md).

---

## Immediate (this sprint)

- [ ] **Merge PR #3** — [ben-git-code/Online-PDF-CV#3](https://github.com/ben-git-code/Online-PDF-CV/pull/3)
- [ ] **Upstream maintainer:** enable fork PR workflows in Actions settings
- [ ] **Upstream maintainer:** enable GitHub Issues on `ben-git-code/Online-PDF-CV`
- [ ] **Create GitHub Project board** — run `gh auth refresh -s read:project,project`, then link issues #17–#30

---

## After merge

- [ ] Sync wiki per [wiki/Sync-Wiki.md](../wiki/Sync-Wiki.md)
- [ ] Verify Firebase production deploy for `/docs`, `/analyzer`, `/compare`
- [ ] Confirm `npm run test:all` green on `master`
- [ ] Close or transfer open fork issues #25–#30 to upstream

---

## Documentation

- [x] Add maintainer docs under `docs/` (roadmap, backlog, how-it-works, …)
- [x] Link `docs/` index from root README
- [ ] Retire or redirect outdated French content in old docs pages

---

## CI / quality

- [x] Fix Prettier gate on CI
- [x] Fix ESLint errors in Playwright config and metadata script
- [x] Green fork CI (build + e2e)
- [ ] Add `CODECOV_TOKEN` secret on fork/upstream
- [ ] Plan Node 24 migration for GitHub Actions (deprecation June 2026)

---

## Product

- [ ] Implement Firebase fallback for missing version PDFs ([#27](https://github.com/benmed00/Online-PDF-CV/issues/27))
- [ ] Decide fate of unused Firebase client files ([#29](https://github.com/benmed00/Online-PDF-CV/issues/29))
- [ ] Wire job-description validation UI if `validate.pug` is kept

---

## Housekeeping

- [ ] Review Dependabot alerts on fork default branch
- [ ] Regenerate Playwright media after any UI change
- [ ] Bump patch version after merge if needed

---

_Last updated: 2026-06-07_
