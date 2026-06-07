# Sync Wiki

The `wiki/` folder in this repository contains **source Markdown** for the GitHub Wiki. GitHub Wikis live in a separate git repository.

## Publish to GitHub Wiki

### 1. Enable wiki on GitHub

Repository **Settings → Features → Wikis** (must be enabled).

### 2. Clone the wiki repository

```bash
git clone https://github.com/ben-git-code/Online-PDF-CV.wiki.git
```

### 3. Copy pages from this repo

Copy all files from `Online-PDF-CV/wiki/` into the cloned wiki repository **except** this file (`Sync-Wiki.md`) unless you want it published too.

Required pages:

- `Home.md`
- `Getting-Started.md`
- `Development.md`
- `Testing-and-Usability.md`
- `Deployment.md`
- `API-Reference.md`
- `Troubleshooting.md`
- `_Sidebar.md`

### 4. Commit and push

```bash
cd Online-PDF-CV.wiki
git add .
git commit -m "docs: sync wiki from main repository"
git push origin master
```

## Image and video assets

Wiki pages reference media hosted in the **main repository** under `docs/assets/` using raw GitHub URLs, for example:

```markdown
![Home](https://raw.githubusercontent.com/ben-git-code/Online-PDF-CV/master/docs/assets/screenshots/01-home-desktop.png)
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
