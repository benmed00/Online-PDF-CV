## GitHub tracking (fork: `benmed00/Online-PDF-CV`)

This PR is tracked on the fork because upstream `ben-git-code/Online-PDF-CV` has **Issues disabled** and the contributor lacks write access.

### Milestone

- [**v3.6.2 — Platform Hardening**](https://github.com/benmed00/Online-PDF-CV/milestone/1) (due 2026-06-30)

### Labels (23 custom)

Type: `type: bug`, `type: documentation`, `type: enhancement`, `type: ci/cd`, `type: testing`, `type: refactor`, `type: security`, `type: deployment`, `type: infrastructure`  
Priority: `priority: critical` … `priority: low`  
Status: `status: resolved`, `status: in-progress`, `status: blocked`  
Area: `area: express`, `area: firebase`, `area: playwright`, `area: docs`, `area: dependencies`  
PR scope: `pr-3`

### Resolved by this PR (closed)

| Issue                                                      | Title                                               |
| ---------------------------------------------------------- | --------------------------------------------------- |
| [#17](https://github.com/benmed00/Online-PDF-CV/issues/17) | Merge conflicts prevented application startup       |
| [#18](https://github.com/benmed00/Online-PDF-CV/issues/18) | Express 5 incompatible route syntax                 |
| [#19](https://github.com/benmed00/Online-PDF-CV/issues/19) | Firebase could not serve /docs, /analyzer, /compare |
| [#20](https://github.com/benmed00/Online-PDF-CV/issues/20) | npm audit vulnerabilities                           |
| [#21](https://github.com/benmed00/Online-PDF-CV/issues/21) | Missing Playwright usability coverage               |
| [#22](https://github.com/benmed00/Online-PDF-CV/issues/22) | CI workflow targeted wrong branch                   |
| [#23](https://github.com/benmed00/Online-PDF-CV/issues/23) | Centralized logging and error handling              |
| [#24](https://github.com/benmed00/Online-PDF-CV/issues/24) | Path traversal risk on /resume/:version             |

### Follow-up (open)

| Issue                                                      | Title                                     |
| ---------------------------------------------------------- | ----------------------------------------- |
| [#25](https://github.com/benmed00/Online-PDF-CV/issues/25) | Enable GitHub Issues on upstream          |
| [#26](https://github.com/benmed00/Online-PDF-CV/issues/26) | Enable GitHub Actions checks for fork PRs |
| [#27](https://github.com/benmed00/Online-PDF-CV/issues/27) | Firebase static fallback for missing PDFs |
| [#28](https://github.com/benmed00/Online-PDF-CV/issues/28) | Sync wiki/ to GitHub Wiki                 |
| [#29](https://github.com/benmed00/Online-PDF-CV/issues/29) | Remove unused Firebase client scaffolding |
| [#30](https://github.com/benmed00/Online-PDF-CV/issues/30) | Automate GitHub Wiki sync                 |

---

## Why no CI checks appear on this PR?

Only **CodeRabbit** runs today because:

1. **`ben-git-code/Online-PDF-CV` has no `ci.yml` on `master`** — only Firebase hosting workflows exist upstream.
2. **This PR comes from a fork** — upstream must enable **Settings → Actions → “Run workflows from fork pull requests”** before workflow checks from this branch can report here.
3. **Firebase preview deploy** intentionally skips fork PRs (`head.repo != github.repository`).

### CI status on the fork (source of truth until upstream enables fork workflows)

[![CI](https://github.com/benmed00/Online-PDF-CV/actions/workflows/ci.yml/badge.svg?branch=platform-hardening-and-docs)](https://github.com/benmed00/Online-PDF-CV/actions/workflows/ci.yml)

Latest run: see [Actions → CI](https://github.com/benmed00/Online-PDF-CV/actions/workflows/ci.yml?query=branch%3Aplatform-hardening-and-docs)

### Maintainer actions to surface checks on PR #3

1. Merge or cherry-pick `.github/workflows/ci.yml` into `ben-git-code/master`, **or** enable fork PR workflows.
2. Enable **Issues** on upstream if you want labels/milestones there instead of the fork.
3. Optionally add `CODECOV_TOKEN` secret for coverage uploads.

---

_Tracking metadata created via `scripts/setup-github-metadata.js` on the fork._
