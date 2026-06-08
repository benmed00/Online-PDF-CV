# Backlog

Prioritized work backlog mapped to GitHub issues on the fork tracker [`benmed00/Online-PDF-CV`](https://github.com/benmed00/Online-PDF-CV/issues).

---

## Priority legend

| Label                | Meaning                        |
| -------------------- | ------------------------------ |
| `priority: critical` | Blocks release or production   |
| `priority: high`     | Required for current milestone |
| `priority: medium`   | Should ship soon after merge   |
| `priority: low`      | Nice to have                   |

---

## Open backlog

### High priority

| ID   | Title                                                       | Area     | Issue                                                      |
| ---- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| B-01 | Enable GitHub Actions checks for fork PRs on upstream       | ci/cd    | [#26](https://github.com/benmed00/Online-PDF-CV/issues/26) |
| B-02 | Firebase static fallback when resume version PDF is missing | firebase | [#27](https://github.com/benmed00/Online-PDF-CV/issues/27) |

### Medium priority

| ID   | Title                                       | Area           | Issue                                                      |
| ---- | ------------------------------------------- | -------------- | ---------------------------------------------------------- |
| B-03 | Enable GitHub Issues on upstream repository | infrastructure | [#25](https://github.com/benmed00/Online-PDF-CV/issues/25) |
| B-04 | Sync `wiki/` source to GitHub Wiki          | docs           | [#28](https://github.com/benmed00/Online-PDF-CV/issues/28) |
| B-05 | Create GitHub Project board for v3.6.2      | infrastructure | — (blocked on `gh` project scope)                          |

### Low priority

| ID   | Title                                                  | Area     | Issue                                                      |
| ---- | ------------------------------------------------------ | -------- | ---------------------------------------------------------- |
| B-06 | Remove or integrate unused Firebase client scaffolding | firebase | [#29](https://github.com/benmed00/Online-PDF-CV/issues/29) |
| B-07 | Automate GitHub Wiki sync from `wiki/` folder          | ci/cd    | [#30](https://github.com/benmed00/Online-PDF-CV/issues/30) |
| B-08 | Consolidate legacy French `docs/README.md` content     | docs     | —                                                          |
| B-09 | Add `CODECOV_TOKEN` for coverage reporting             | ci/cd    | —                                                          |
| B-10 | Migrate GitHub Actions to Node 24                      | ci/cd    | —                                                          |

---

## Completed (v3.6.2)

| ID        | Title                                | Issue                                                      |
| --------- | ------------------------------------ | ---------------------------------------------------------- |
| B-DONE-01 | Merge conflicts prevented startup    | [#17](https://github.com/benmed00/Online-PDF-CV/issues/17) |
| B-DONE-02 | Express 5 route syntax               | [#18](https://github.com/benmed00/Online-PDF-CV/issues/18) |
| B-DONE-03 | Firebase static pages for tools      | [#19](https://github.com/benmed00/Online-PDF-CV/issues/19) |
| B-DONE-04 | npm audit vulnerabilities            | [#20](https://github.com/benmed00/Online-PDF-CV/issues/20) |
| B-DONE-05 | Playwright usability + media         | [#21](https://github.com/benmed00/Online-PDF-CV/issues/21) |
| B-DONE-06 | CI branch targeting                  | [#22](https://github.com/benmed00/Online-PDF-CV/issues/22) |
| B-DONE-07 | Logging and error handling           | [#23](https://github.com/benmed00/Online-PDF-CV/issues/23) |
| B-DONE-08 | Path traversal on `/resume/:version` | [#24](https://github.com/benmed00/Online-PDF-CV/issues/24) |

---

## Adding backlog items

1. Open an issue on the fork with labels `type:`, `priority:`, `area:`.
2. Assign milestone **v3.6.2 — Platform Hardening** (or next milestone).
3. Add a row to this file and link the issue number.
4. Reference in [roadmap.md](roadmap.md) if it affects a release phase.

Script to recreate labels/issues: `node scripts/setup-github-metadata.js`
