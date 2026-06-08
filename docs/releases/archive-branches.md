# Archive branches

Long-lived Git branches that preserve **historical snapshots** of the repository. They mirror tagged releases so you can browse, clone, or open a PR against a fixed point in time without relying on tags alone.

**Active development stays on `master`.** Archive branches are read-only references for maintainers and contributors researching the project history.

---

## Branch index

| Branch                                                                                                                                | Tag source                                                                                        | Commit    | Date       | Purpose                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------- | ---------- | --------------------------------------------------------------------------------------- |
| [`archive/first-release-working-messy-code`](https://github.com/benmed00/Online-PDF-CV/tree/archive/first-release-working-messy-code) | [`working-messy-code`](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code) | `1bddfbc` | 2023-06-02 | **First tagged release** — original minimal Firebase PDF host before the major refactor |

---

## `archive/first-release-working-messy-code`

This branch points at the same tree as tag `working-messy-code`: the **ancien** (pre-refactor) codebase — 22 files, Express 4 + Jade, Firebase static hosting, no tests.

| Item               | Value                                      |
| ------------------ | ------------------------------------------ |
| **Branch**         | `archive/first-release-working-messy-code` |
| **Tag**            | `working-messy-code`                       |
| **Commit**         | `1bddfbc6358b6c361c58dd21038bb5d05189be9b` |
| **Commit message** | _add build script for GitHub-CI error_     |
| **Published**      | 2023-06-02                                 |

### Why this branch exists

- **Browse on GitHub** — switch to the branch in the UI without checking out locally.
- **Stable ref for docs and issues** — link to `tree/archive/...` instead of only the tag.
- **Worktrees and diffs** — compare `master` against the archive branch for archaeology.

The branch does **not** receive merges from `master`. If the tag is ever recreated, update this branch to match the tag (maintainer-only).

### Checkout without disturbing your current branch

```bash
git fetch origin archive/first-release-working-messy-code

# Option A — detached worktree (recommended)
git worktree add ../Online-PDF-CV-first-release archive/first-release-working-messy-code
cd ../Online-PDF-CV-first-release
npm install && npm start

# Option B — same as the tag (equivalent tree)
git worktree add ../Online-PDF-CV-release working-messy-code

# Option C — clone branch only (shallow)
git clone --branch archive/first-release-working-messy-code --single-branch \
  https://github.com/benmed00/Online-PDF-CV.git Online-PDF-CV-archive
```

### Compare with current code

```bash
git fetch origin master archive/first-release-working-messy-code
git diff --stat archive/first-release-working-messy-code..master
```

### Further reading

- [Release notes: `working-messy-code`](working-messy-code.md) — layout, bugs, and behaviour at this snapshot
- [Project history](../project-history.md) — timeline from this release to today
- [Releases index](README.md)

---

## Creating or updating archive branches (maintainers)

Archive branches are created from an existing tag **without checking out** the old tree:

```bash
# Create local ref from tag (does not change HEAD or working tree)
git branch archive/first-release-working-messy-code working-messy-code

# Push to origin (or use GitHub API if pre-push hooks block branch creation)
git push -u origin archive/first-release-working-messy-code
```

To recreate the remote branch from the tag:

```bash
gh api repos/benmed00/Online-PDF-CV/git/refs \
  -f ref='refs/heads/archive/first-release-working-messy-code' \
  -f sha='1bddfbc6358b6c361c58dd21038bb5d05189be9b'
```

---

## Related

| Document                                 | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| [Releases README](README.md)             | Tagged release index          |
| [Wiki: Releases](../../wiki/Releases.md) | GitHub Wiki release index     |
| [CHANGELOG](../../CHANGELOG.md)          | Version notes from 4.x onward |
