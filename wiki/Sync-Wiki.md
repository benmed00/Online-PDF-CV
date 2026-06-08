# Sync Wiki

The `wiki/` folder in this repository contains **source Markdown** for the GitHub Wiki. GitHub Wikis live in a separate git repository.

## Publish to GitHub Wiki

### 0. First-time only — bootstrap the wiki (required once)

GitHub does **not** create the wiki git repository until the **first page** is saved in the web UI. Until then, `git push` to `.wiki.git` returns _Repository not found_.

1. Open **[Create first wiki page](https://github.com/benmed00/Online-PDF-CV/wiki/_new)** (must be signed in as `benmed00`)
2. **Title:** `Home`
3. Body: any placeholder (e.g. `# Online PDF CV`) — this will be overwritten by sync
4. Click **Save Page**

After that, the wiki git repo exists and automated sync works.

### 1. Enable wiki on GitHub

Repository **Settings → Features → Wikis** (already enabled on `benmed00/Online-PDF-CV`).

### 2. Sync (automated script)

From the project root:

```powershell
.\scripts\sync-wiki-to-github.ps1
```

Or manually:

```bash
git clone https://github.com/benmed00/Online-PDF-CV.wiki.git
# copy wiki/*.md (except Sync-Wiki.md) into the clone
cd Online-PDF-CV.wiki
git add .
git commit -m "docs: sync wiki from main repository"
git push origin master
```

### 3. Copy pages from this repo (manual alternative)

Copy all files from `Online-PDF-CV/wiki/` into the cloned wiki repository **except** this file (`Sync-Wiki.md`) unless you want it published too.

Required pages:

- `Home.md`
- `Getting-Started.md`
- `Development.md`
- `Testing-and-Usability.md`
- `Deployment.md`
- `API-Reference.md`
- `Troubleshooting.md`
- `Project-History.md`
- `Releases.md`
- `_Sidebar.md`

### 4. Commit and push (if not using the script)

```bash
cd Online-PDF-CV.wiki
git add .
git commit -m "docs: sync wiki from main repository"
git push origin master
```

## Image and video assets

Wiki pages reference media hosted in the **main repository** under `docs/assets/` using raw GitHub URLs, for example:

```markdown
![Home](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/01-home-desktop.png)
```

Regenerate assets after UI changes:

```bash
npm run test:all
```

This updates:

- `docs/assets/screenshots/`
- `docs/assets/videos/`

Commit those folders in the main repository, then refresh wiki pages if paths change.

## Wiki syntax notes

| Feature       | Syntax                                  |
| ------------- | --------------------------------------- |
| Internal link | `[[Page-Name]]` or `[Label](Page-Name)` |
| Sidebar       | `_Sidebar.md`                           |
| Footer        | `_Footer.md` (optional)                 |
| Home page     | `Home.md`                               |

## Keep wiki in sync

When documentation changes in the main repo:

1. Edit files in `wiki/`
2. Copy to `Online-PDF-CV.wiki` clone
3. Push wiki repository

Consider automating with a GitHub Action in the future.
