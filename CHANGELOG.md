# Changelog

All notable changes to Online-PDF-CV. For the full timeline and refactor context see [docs/project-history.md](docs/project-history.md) and [docs/releases/](docs/releases/README.md).

---

## Unreleased

### Added

- OpenAPI 3.1 API contract ([`openapi/openapi.yaml`](openapi/openapi.yaml)) with JSDoc path generation (`npm run openapi:generate`) — closes [#34](https://github.com/benmed00/Online-PDF-CV/issues/34)
- Swagger UI at `/api/docs` (Express) and static `GET /api/openapi.yaml` on Firebase after `npm run build`
- Redocly lint in `npm run validate`; maintainer guide [docs/openapi.md](docs/openapi.md)
- Playwright `e2e/openapi.spec.js` — Swagger Try it out → Execute with HTTP assertions
- `@prettier/plugin-pug` for formatting Pug templates in pre-commit

---

## Version 4.1.0 — Analyzer & quality gates (2026-06)

Target release for [PR #32](https://github.com/benmed00/Online-PDF-CV/pull/32). Git tag `v4.1.0` on merge to `master`.

### Added

- File upload extraction, VirusTotal scan, and OpenAI coach on `/analyzer`
- Project history and release documentation under `docs/` and `wiki/`
- Automated version sync (`npm run version:sync`) and merge-time release workflow
- Husky quality gates: pre-commit, commit-msg (conventional commits), pre-push (`validate`)
- Dependabot for npm and GitHub Actions; `npm audit --audit-level=high` in CI

### Changed

- Canonical repository: `benmed00/Online-PDF-CV`
- `package.json` version aligned with git tags (`v4.0.0` platform hardening → `4.1.0` for this wave)

---

## Version 4.0.0 — Platform hardening (2026-06)

Git tag [`v4.0.0`](https://github.com/benmed00/Online-PDF-CV/releases/tag/v4.0.0). Maintainer milestone also referred to as **v3.6.2 platform hardening** — see [docs/releases/platform-hardening-v3.6.2.md](docs/releases/platform-hardening-v3.6.2.md).

### Added

- Express 5 routing with Helmet CSP and version slug validation
- Winston logging, `AppError`, hybrid JSON/HTML error handler
- Static build pipeline (`npm run build`) for Firebase Hosting
- Playwright usability tests with screenshot and video capture
- GitHub Wiki source (`wiki/`) and maintainer docs hub (`docs/`)
- CI workflow: lint, test, build, e2e on `master`

### Fixed

- Merge conflicts in `app.js`, `package.json`, views
- `app.get('*')` wildcard serving PDF for all routes (inherited from pre-refactor base)
- Unmounted routers, unreachable 404 handler
- Path traversal on `/resume/:version`
- 11 npm audit vulnerabilities remediated

---

## Version 4.0.0 — Feature enhancement (2025)

See [docs/project-history.md#phase-3--platform-build-out-20252026](docs/project-history.md) for context.

### New Features

#### Multiple Resume Versions Support

- Added support for serving different resume versions via `/resume/:version` route
- Created a directory structure for storing multiple resume versions
- Added a script to easily add new resume versions
- Implemented fallback to default resume if requested version doesn't exist

#### API Endpoints

- Added `/api/versions` endpoint to provide information about available resume versions in JSON format
- Implemented dynamic version detection from the file system

#### Documentation Page

- Created a `/docs` route with comprehensive API documentation
- Designed a clean documentation page using Pug templates
- Added examples for using the resume API with cURL and JavaScript

#### Resume Analyzer Tool

- Created a `/analyzer` route with a resume analysis tool
- Implemented a JavaScript class to analyze resume content for keywords
- Designed an interactive UI for the analyzer with score visualization
- Added suggestions for resume improvement based on analysis

#### Resume Comparison Tool

- Created a `/compare` route to compare different resume versions side by side
- Implemented a dual-view interface for easy comparison
- Added dynamic version selection based on available resume versions

#### Resume Templates

- Added a script to create HTML templates for different resume versions
- Implemented a clean, responsive design for the templates
- Added instructions for converting templates to PDF

#### Format Export

- Added a script to export resumes to different formats (JSON, TXT, Markdown)
- Created a simple export structure for each format
- Added documentation for using the export functionality

#### SEO Improvements

- Added meta tags for better search engine indexing
- Created a sitemap generation script for improved discoverability
- Added robots.txt file for search engine guidance

#### Testing Infrastructure

- Set up Jest as the testing framework
- Created test files for API endpoints and routes
- Added test scripts to package.json

#### UI/UX Improvements

- Updated the layout with a responsive navigation menu
- Improved the styling with a modern CSS approach
- Created a better error page with user-friendly messaging

### Technical Improvements

#### Code Quality

- Added ESLint for code linting
- Added Prettier for code formatting
- Created configuration files for consistent code style

#### Documentation

- Enhanced the README.md with new features and instructions
- Added documentation for all new functionality
- Created a CHANGELOG.md to track version changes

#### Scripts

- Added script for adding new resume versions
- Added script for generating sitemap.xml
- Added script for creating resume templates
- Added script for exporting resumes to different formats

### Bug Fixes

- Fixed issue with path resolution for resume files
- Improved error handling for missing files
- Enhanced mobile responsiveness

## Version 3.6.2 — `working-messy-code` (2023-06-02)

Tagged release [`working-messy-code`](https://github.com/benmed00/Online-PDF-CV/releases/tag/working-messy-code). Full notes: [docs/releases/working-messy-code.md](docs/releases/working-messy-code.md).

- Basic Express.js application (6 dependencies, 22 files)
- Firebase Hosting with static `index.html` embedding `resume.pdf`
- Express server had unmounted routers and a wildcard PDF route (broken for local dev)
- Jade templates present but unused in production
- No tests, no CI beyond Firebase deploy workflows

---

## Version 1.x — Initial version (2019)

- Initial Express + Jade CV host
- Heroku deployment references (later replaced by Firebase)
