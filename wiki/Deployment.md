# Deployment

## Firebase Hosting

### Prerequisites

- Firebase project (default: `benyakoub-cv`)
- Firebase CLI authenticated (`firebase login`)

### Manual deploy

```bash
npm run build
npm run deploy
```

`npm run build` must run before deploy so Firebase serves pre-rendered HTML for `/docs`, `/analyzer`, and `/compare`.

### Hosting configuration

`firebase.json` defines:

| Rewrite | Target |
|---------|--------|
| `/api/versions` | `/api/versions.json` |
| `/resume` | `/resume.pdf` |
| `/resume/:version` | `/resumes/:version.pdf` |

Static files in `public/` are served directly when they exist.

## Continuous deployment

GitHub Actions workflows:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | Push/PR to `master` | Lint, test, build, coverage |
| `firebase-hosting-merge.yml` | Push to `master` | Deploy to live channel |
| `firebase-hosting-pull-request.yml` | Pull requests | Preview deployment |

## Custom domain

1. Add domain in Firebase Hosting console
2. Rebuild with your canonical URL:

```bash
SITE_URL=https://yourdomain.com npm run build
```

3. Redeploy

## SEO

Generate a sitemap:

```bash
npm run generate-sitemap -- https://yourdomain.com
```

Output: `public/sitemap.xml`

## Security

- Do not commit `.env` or Firebase service account keys
- Storage rules deny all writes by default
- Helmet CSP is enabled in Express for local development

See [[Troubleshooting]] for deploy failures.

## Related pages

- [[Getting-Started]]
- [[API-Reference]]
