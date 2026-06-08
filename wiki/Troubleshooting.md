# Troubleshooting

## Server will not start

### Port already in use

```bash
# Windows PowerShell
$env:PORT=3001; npm start
```

### Merge conflict markers in source

Search for `<<<<<<<` in `app.js`, `package.json`, and view templates. Resolve conflicts before starting the server.

---

## Playwright failures

### Browsers not installed

```bash
npx playwright install chromium
```

### Jest picks up Playwright tests

Ensure `e2e/` is listed in `testPathIgnorePatterns` inside `jest.config.js`.

### PDF route throws "Download is starting"

PDF endpoints trigger downloads in browser tests. Use Playwright `request.get('/resume')` instead of `page.goto('/resume')`.

---

## Firebase deploy shows wrong page

1. Run `npm run build` before deploy
2. Confirm `public/index.html` is the CV home page, not the Firebase welcome template
3. Check `firebase.json` rewrites

---

## Missing resume PDF

Ensure these files exist:

- `public/resume.pdf` (required fallback)
- `public/resumes/default.pdf` (recommended)

---

## Permission denied on git push

Verify GitHub credentials for `benmed00/Online-PDF-CV` or push to a fork and open a pull request.

---

## Logs

Express logs:

- `logs/all.log`
- `logs/error.log`

Run with `NODE_ENV=development` for verbose Winston output.

---

## Analyzer / AI Coach

### AI checkbox visible but Coach tab empty

1. Confirm `OPENAI_API_KEY` in `.env` and restart the server (`npm start`).
2. Check server logs for OpenAI HTTP status.
3. **429 quota/billing:** add credits at [platform.openai.com](https://platform.openai.com/) — local scores still work.
4. **401 invalid key:** rotate the key if it was ever exposed; update `.env`.

### Upload / VirusTotal not working on production site

Firebase Hosting serves static HTML only. Word/PDF upload scanning and extraction need Express:

```bash
npm start
# open http://localhost:3000/analyzer
```

See [known-issues.md](../docs/known-issues.md) for Firebase vs Express analyzer limits.

## Related pages

- [[Testing-and-Usability]]
- [[Deployment]]
