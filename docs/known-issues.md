# Known issues

Documented limitations and bugs as of v4.1.0.

---

## Firebase vs Express behavior

### Missing version PDF — no fallback on Firebase

**Symptom:** `/resume/unknown` falls back to default PDF on Express but returns **404** on Firebase Hosting.

**Cause:** Rewrite points directly to `/resumes/:version.pdf` with no fallback rule.

**Tracking:** [#27](https://github.com/benmed00/Online-PDF-CV/issues/27)

---

### Static pages require rebuild before deploy

**Symptom:** Pug template changes not visible on Firebase until `npm run build`.

**Fix:** Always run `npm run build` before `firebase deploy`.

---

### Analyzer APIs need Cloud Functions on Firebase

**Symptom:** On production Firebase, analyzer upload/AI features fail if only Hosting is deployed.

**Cause:** `POST /api/analyze`, `POST /api/extract-resume`, and `GET /api/analyzer/config` are served by the `api` Cloud Function (`functions/src/index.ts`), not static files.

**Fix:** Deploy functions with secrets configured:

```bash
firebase deploy --only functions,hosting
```

Set `OPENAI_API_KEY` and `VIRUSTOTAL_API_KEY` in Firebase Functions environment (or `.env` for local emulators). See [functions/README.md](../functions/README.md).

**Status:** Resolved when Functions are deployed with API rewrites in `firebase.json`.

---

### OpenAI AI Coach — quota or billing

**Symptom:** AI checkbox visible but AI Coach tab empty; API returns `aiInsights.available: false` with quota/billing message.

**Cause:** `OPENAI_API_KEY` is set but OpenAI returns HTTP 429 (quota exceeded).

**Fix:** Add billing credits at [platform.openai.com](https://platform.openai.com/). Local keyword scores and checks still work without AI.

---

## Development

### ESLint warnings on startup banner

**Symptom:** `no-console` warnings in `app.js` startup logging.

**Status:** Accepted — intentional startup logging. Not CI-blocking (warnings only).

---

### Prettier vs ESLint numeric separators

**Symptom:** Prettier may format `60000` with separators; ESLint parser rejects `60_000`.

**Fix:** Use plain numbers in `playwright.config.js` and similar config files.

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
2. Open an issue on [benmed00/Online-PDF-CV](https://github.com/benmed00/Online-PDF-CV/issues).
3. Add an entry here if it affects users or operators.
