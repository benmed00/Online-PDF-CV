# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.6.x   | :white_check_mark: |
| 3.5.x   | :x:                |
| < 3.5   | :x:                |

## Reporting a Vulnerability

If you discover a security issue, please report it privately rather than opening a public issue.

1. Email the maintainer with a description of the vulnerability and steps to reproduce it.
2. Allow up to 7 days for an initial response.
3. Allow reasonable time for a fix before public disclosure.

Please do not report security issues through public GitHub issues.

## Security Practices

- Keep dependencies updated (`npm audit`, Dependabot).
- Do not commit secrets, Firebase service account keys, or `.env` files.
- Resume PDFs in `public/` are intentionally public; do not store private data there.
