# Known issues

Documented limitations and bugs as of v3.6.2.

---

## Platform & CI

### No CI checks on upstream fork PRs

**Symptom:** [PR #3](https://github.com/ben-git-code/Online-PDF-CV/pull/3) shows only CodeRabbit, not GitHub Actions.

**Cause:**

- Upstream `master` lacks `ci.yml` until PR merges
- Fork PR workflows disabled by default on upstream
- Firebase preview workflow skips external forks

**Workaround:** Monitor fork CI badge: [benmed00/Online-PDF-CV Actions](https://github.com/benmed00/Online-PDF-CV/actions/workflows/ci.yml)

**Tracking:** [#26](https://github.com/benmed00/Online-PDF-CV/issues/26)

---

### Upstream GitHub Issues disabled

**Symptom:** Cannot open issues on `ben-git-code/Online-PDF-CV`.

**Workaround:** Track on fork [`benmed00/Online-PDF-CV`](https://github.com/benmed00/Online-PDF-CV/issues).

**Tracking:** [#25](https://github.com/benmed00/Online-PDF-CV/issues/25)

---

## Firebase vs Express behavior

### Missing version PDF — no fallback on Firebase

**Symptom:** `/resume/unknown` falls back to default PDF on Express but returns **404** on Firebase Hosting.

**Cause:** Rewrite points directly to `/resumes/:version.pdf` with no fallback rule.

**Tracking:** [#27](https://github.com/benmed00/Online-PDF-CV/issues/27)

---

### Static analyzer/compare require rebuild

**Symptom:** Pug template changes not visible on Firebase until `npm run build`.

**Fix:** Always run build before deploy.

---

## Development

### ESLint warnings on startup banner

**Symptom:** `no-console` warnings in `app.js` lines 153–175.

**Status:** Accepted — intentional startup logging. Not CI-blocking (warnings only).

---

### Prettier vs ESLint numeric separators

**Symptom:** Prettier may format `60000` with separators; ESLint parser rejects `60_000`.

**Fix:** Use plain numbers in `playwright.config.js` and similar config files.

---

## Dependencies

### Fork default branch Dependabot alerts

**Symptom:** GitHub reports vulnerabilities on fork `master` (legacy branch, not PR branch).

**Note:** PR branch `platform-hardening-and-docs` audit was remediated to 0 vulnerabilities.

**Action:** Merge PR or update fork default branch.

---

## Documentation

### Legacy French docs/README.md

**Symptom:** Old French overview with outdated stack versions (Express 4, Jade).

**Status:** Superseded by root README and new `docs/` set. Pending cleanup.

---

## Unused code

### Firebase client scaffolding

**Files:** `src/lib/firebase.ts`, `src/config/firebase.ts`, `public/js/firebase-config.js`

**Status:** Not integrated into main resume flow.

**Tracking:** [#29](https://github.com/benmed00/Online-PDF-CV/issues/29)

---

## Testing

### Playwright PDF download via navigation

**Symptom:** `page.goto('/resume')` may trigger download instead of page load.

**Fix:** Use `request.get('/resume')` in e2e tests (already applied).

---

## Reporting new issues

1. Check this list and [backlog.md](backlog.md).
2. Open issue on fork with appropriate labels.
3. Add entry here if it affects users or operators.
