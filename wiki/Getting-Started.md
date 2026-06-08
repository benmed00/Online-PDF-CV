# Getting Started

This guide helps you publish your own PDF resume using Online-PDF-CV.

## Prerequisites

- Node.js **22+** (see `.nvmrc`)
- npm
- A Firebase account (for production hosting)
- Firebase CLI (`npm install -g firebase-tools`)

## Installation

```bash
git clone https://github.com/benmed00/Online-PDF-CV.git
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
firebase deploy --only functions,hosting
```

Use `npm run deploy` for hosting-only (static pages and PDFs). Full analyzer APIs require the Cloud Function — see [[Deployment]].

## Next steps

- [[Development]] — scripts and project layout
- [[Testing-and-Usability]] — verify the UI with Playwright
- [[API-Reference]] — programmatic access to resume versions
