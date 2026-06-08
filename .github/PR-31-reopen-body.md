> **Replaces [#31](https://github.com/benmed00/Online-PDF-CV/pull/31)** — GitHub cannot reopen a merged PR. `master` was reverted to `a85cf9c`; all platform-hardening work remains on `platform-hardening-and-docs`.

Same scope as PR #31: Express 5 routing, Firebase static build, Jest + Playwright CI, docs/wiki/media, security hardening (Helmet, path validation), v3.6.2.

**Review before merge** — do not merge until explicitly approved.

## Quick test

```bash
git checkout platform-hardening-and-docs
npm install
npx playwright install chromium
npm run test:all
npm start
```

See full description, screenshots, and checklist in the closed PR #31 thread.
