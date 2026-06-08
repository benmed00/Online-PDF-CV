# Known issues

Documented limitations and bugs as of v4.2.0.

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

### Analyzer APIs on Firebase (Cloud Functions)

**Symptom:** Capability strip shows “Basic scores only” or upload/AI/hosted-CV extract fails on production.

**Cause:** Analyzer APIs are served by the `api` Cloud Function, not static Hosting files:

- `GET /api/analyzer/config`
- `POST /api/analyze`
- `POST /api/extract-resume`
- `POST /api/extract-resume-version`

**Fix:** Deploy functions with secrets configured:

```bash
npm run build
firebase deploy --only functions,hosting
```

Set `OPENAI_API_KEY` and `VIRUSTOTAL_API_KEY` via Firebase Secret Manager (or `.env` for local emulators). Set `HOSTING_URL` / `SITE_URL` so hosted-CV extraction can fetch PDFs from Hosting. See [functions/README.md](../functions/README.md).

**Verification checklist (preview or production):**

1. `/api/analyzer/config` returns `mode: "functions"` with `openAi` / `virusTotal` flags
2. Upload `.docx` on `/analyzer` completes scan + extraction
3. My CV tab loads text via `POST /api/extract-resume-version`
4. Analyze with job description shows Job match tab
5. AI Coach tab when OpenAI billing is active

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
