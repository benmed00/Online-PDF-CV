# Getting Started

This guide helps you publish your own PDF resume using Online-PDF-CV.

## Prerequisites

- Node.js **16.17.1+**
- npm
- A Firebase account (for production hosting)
- Firebase CLI (`npm install -g firebase-tools`)

## Installation

```bash
git clone https://github.com/ben-git-code/Online-PDF-CV.git
cd Online-PDF-CV
npm install
```

## Add your resume

1. Replace `public/resume.pdf` with your main CV PDF.
2. Optional: add versioned PDFs in `public/resumes/`:
   - `public/resumes/default.pdf`
   - `public/resumes/technical.pdf`
   - `public/resumes/executive.pdf`

### Add a version with the helper script

```bash
npm run add-version -- /path/to/resume.pdf technical
```

Accessible at `/resume/technical`.

## Run locally

```bash
# Production-style entrypoint
npm start

# Direct app.js startup (development)
npm run dev
```

Default URL: http://localhost:3000

## Customize branding

Edit `views/layout.pug` and `routes/index.js` for:

- page title
- SEO metadata
- navigation labels

## Build static pages for Firebase

```bash
npm run build
```

Generates HTML into `public/` for hosting without a Node runtime.

## Deploy

```bash
firebase login
npm run deploy
```

See [[Deployment]] for CI/CD and rewrite rules.

## Next steps

- [[Development]] — scripts and project layout
- [[Testing-and-Usability]] — verify the UI with Playwright
- [[API-Reference]] — programmatic access to resume versions
