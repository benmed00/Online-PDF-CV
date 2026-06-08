# Contributing to Online-PDF-CV

Thank you for considering contributing to Online-PDF-CV! This document outlines the guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template if available
- Include detailed steps to reproduce the bug
- Include screenshots if applicable
- Specify your environment (OS, browser, Node.js version)

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the Issues section
- Provide a clear description of the enhancement
- Explain why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks: `npm run validate` (or let Husky hooks run automatically on commit/push)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Code quality (required)

This project enforces formatting and linting **before every commit** and runs CI checks **before every push**.

| Hook / command             | What it runs                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| **pre-commit** (automatic) | `lint-staged` → Prettier + ESLint fix on staged files, then full-repo `format:check` + `lint`          |
| **commit-msg** (automatic) | Conventional commit format (`feat:`, `fix:`, `docs:`, …)                                               |
| **pre-push** (automatic)   | `npm run validate` — same gate as CI build job                                                         |
| `npm run format`           | Format entire repository (use before large doc changes)                                                |
| `npm run precommit`        | Manual pre-commit pipeline without committing                                                          |
| `npm run validate`         | `format:check` + `lint` + `audit:check` + `version:check` + `openapi:lint` + `test:coverage` + `build` |
| `npm run validate:full`    | `validate` + Playwright e2e                                                                            |
| `npm run test:all`         | `validate:full` + publish Playwright media to `docs/assets/`                                           |

```bash
# Fix formatting across the repo
npm run format

# Run the same checks as CI (without e2e)
npm run validate

# Full local CI including Playwright
npm run validate:full
```

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(analyzer): add keyword density scoring
fix: reject invalid resume slug
docs: document quality gate workflow
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

**Versioning:** run `npm run version:sync` before opening a release PR if you added `feat:` or breaking commits since the last `v*` tag. CI runs `npm run version:check` inside `validate`. On merge to `master`, the release workflow tags `vX.Y.Z` automatically.

To bypass hooks in an emergency only: `git commit --no-verify` / `git push --no-verify` (not recommended).

See [docs/best-practices.md](docs/best-practices.md#quality-gates) for the full gate diagram and troubleshooting.

## Testing

Automated tests are required for changes that affect routes, utilities, or build output:

```bash
npm test                 # Jest unit/integration
npm run test:coverage    # Jest with coverage thresholds
npm run test:e2e         # Playwright usability
npm run test:all         # Full pipeline + media artifacts
```

## Documentation

When adding new features or making changes, please update the documentation accordingly:

- Update the README.md if necessary
- **When changing API routes or request/response shapes**, update [`openapi/jsdoc-routes.js`](openapi/jsdoc-routes.js) and schemas in [`openapi/openapi.base.yaml`](openapi/openapi.base.yaml), then run `npm run openapi:validate` (see [docs/openapi.md](docs/openapi.md))
- Add comments to your code
- Update any relevant documentation files (including [wiki/API-Reference.md](wiki/API-Reference.md))

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [Apache License 2.0](LICENSE).
