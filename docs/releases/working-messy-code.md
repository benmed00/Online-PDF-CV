# Release: `working-messy-code`

**Tag:** [`working-messy-code`](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code)  
**Commit:** `1bddfbc` — _add build script for GitHub-CI error_  
**Published:** 2023-06-02  
**Author:** [benmed00](https://github.com/benmed00)

This is the **last tagged snapshot** of the original minimal application before the major refactor. The tag name reflects the author's assessment: the app **worked in production** via Firebase Hosting, but the **Express server code was messy and partially broken**.

---

## What this release was

A **single-PDF resume host** deployed to Firebase. The live site embedded `resume.pdf` in a static HTML page with Firebase SDK boilerplate and Google Analytics.

| Metric              | Value                                    |
| ------------------- | ---------------------------------------- |
| Files in repository | 22                                       |
| npm dependencies    | 6 (`express@4.18`, `jade`, `morgan`, …)  |
| npm scripts         | `start`, `star`, `deploy`, empty `build` |
| Views               | Jade templates (largely unused)          |
| Tests               | None                                     |
| CI                  | Firebase Hosting deploy workflows only   |

---

## Repository layout at this tag

```
Online-PDF-CV/
├── app.js                 # Express app (see bugs below)
├── bin/www                # HTTP server entry
├── firebase.json          # Rewrites all routes → /index.html
├── package.json
├── public/
│   ├── index.html         # Firebase boilerplate + <embed src="resume.pdf">
│   ├── resume.pdf         # The CV
│   └── stylesheets/style.css
├── routes/
│   ├── index.js           # Unused — never mounted
│   └── users.js           # Unused — never mounted
└── views/
    ├── error.jade
    ├── index.jade
    └── layout.jade
```

---

## How production worked (Firebase Hosting)

Production did **not** rely on the Express server. Firebase served static files from `public/`:

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

Every URL returned `index.html`, which embedded the PDF:

```html
<embed type="application/pdf" src="resume.pdf" height="1000px" width="100%" />
```

Firebase SDK scripts and Google Tag Manager were included but largely unused.

---

## Express server behaviour (local dev)

When running `npm start` locally, behaviour differs from production:

| Route           | HTTP status | Content type      | What you get                           |
| --------------- | ----------- | ----------------- | -------------------------------------- |
| `/`             | 200         | `text/html`       | `public/index.html` (static file wins) |
| `/index.html`   | 200         | `text/html`       | Same Firebase boilerplate page         |
| `/docs`         | 200         | `application/pdf` | Raw PDF (wildcard bug)                 |
| `/analyzer`     | 200         | `application/pdf` | Raw PDF (wildcard bug)                 |
| `/api/versions` | 200         | `application/pdf` | Raw PDF (wildcard bug)                 |
| Any other path  | 200         | `application/pdf` | Raw PDF (wildcard bug)                 |

### Critical bugs in `app.js`

1. **Routers never mounted** — `indexRouter` and `usersRouter` are imported but `app.use()` is never called.
2. **Wildcard PDF route** — `app.get('*', …)` sends `resume.pdf` for every unmatched GET request.
3. **404 handler unreachable** — the wildcard catches all GET requests before the 404 middleware runs.
4. **Jade views unused** — home page comes from static `index.html`, not `views/index.jade`.

```javascript
// Simplified problematic pattern at this tag
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/resume.pdf'));
});
// indexRouter imported but never: app.use('/', indexRouter);
```

---

## Dependencies (`package.json`)

```json
{
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "debug": "^4.3.4",
    "express": "^4.18.2",
    "http-errors": "^2.0.0",
    "jade": "~1.11.0",
    "morgan": "^1.10.0"
  }
}
```

`npm audit` at install time reports multiple vulnerabilities (deprecated `jade`, outdated transitive deps).

---

## Run this release locally

```bash
git fetch origin tag working-messy-code
git worktree add ../Online-PDF-CV-release working-messy-code
cd ../Online-PDF-CV-release
npm install
npm start
# → http://localhost:3000
```

**Expected result:** Home page shows the embedded PDF. Any path other than `/` or static assets returns the PDF file.

To compare with the current codebase side by side:

```bash
# Terminal 1 — release on port 3001
cd ../Online-PDF-CV-release
$env:PORT=3001; npm start

# Terminal 2 — current on port 3000
cd Online-PDF-CV
npm start
```

---

## Commits on release day (2023-06-02)

| Commit    | Message                                         |
| --------- | ----------------------------------------------- |
| `a22dd72` | correction of the deployement-file              |
| `883ad58` | Add google tag                                  |
| `b94e4d5` | Update the favicon                              |
| `542b311` | Update the title of the page                    |
| `1bddfbc` | add build script for GitHub-CI error _(tagged)_ |

---

## What changed after this release

| Period              | Summary                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Oct 2023 – Jul 2024 | CV content updates, README fixes, Snyk security PRs — no architecture change                                                        |
| Aug 2025            | First refactor ([PR #1](https://github.com/ben-git-code/Online-PDF-CV/pull/1)): removed wildcard, mounted routers, Jade→Pug, Helmet |
| 2025–2026           | Platform hardening ([PR #31](https://github.com/benmed00/Online-PDF-CV/pull/31)): Express 5, tools, static build, tests, docs       |
| 2026                | Analyzer enhancements: file upload, VirusTotal, OpenAI coach                                                                        |

See [Project history](../project-history.md) for the full timeline and objectives.

---

## Related documentation

| Document                   | Link                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Releases index             | [README.md](README.md)                                                                                    |
| Full project timeline      | [project-history.md](../project-history.md)                                                               |
| Current architecture       | [how-it-works.md](../how-it-works.md)                                                                     |
| Platform hardening release | [platform-hardening-v3.6.2.md](platform-hardening-v3.6.2.md)                                              |
| GitHub release page        | [working-messy-code on GitHub](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code) |
| Wiki version               | [Releases (wiki)](../../wiki/Releases.md)                                                                 |
