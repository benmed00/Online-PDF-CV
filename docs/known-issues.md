# Known issues

Documented limitations and bugs as of v3.6.2.

---

## Platform & CI

### Legacy `master` branch on GitHub

**Symptom:** [benmed00/Online-PDF-CV `master`](https://github.com/benmed00/Online-PDF-CV) still shows the old README until `platform-hardening-and-docs` is merged.

**Fix:** Merge [PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31) or push `master` from local hardening branch.

---

### Stale open PRs (Snyk / Dependabot)

**Symptom:** Multiple open PRs target Express 4.x security bumps while the hardening branch uses Express 5.

**Action:** Close superseded PRs after merging platform hardening to `master`.

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
