# Online PDF CV

Host your PDF resume online with **Express.js** and **Firebase Hosting**.

**Live demo:** https://benyakoub-cv.firebaseapp.com/

## Overview

Online-PDF-CV is a lightweight platform for publishing a professional resume as a PDF, with optional tools for:

- multiple resume versions (`/resume/:version`)
- API discovery (`/api/versions`)
- interactive documentation (`/docs`)
- guided resume analyzer (`/analyzer` — hosted CV, job match, export)
- side-by-side version comparison (`/compare`)
- job description matching (`/analyzer` step 2 — Job match tab)

## Quick start

```bash
git clone https://github.com/benmed00/Online-PDF-CV.git
cd Online-PDF-CV
npm install
npm start
```

Open http://localhost:3000

## Documentation map

| Page                      | Description                                       |
| ------------------------- | ------------------------------------------------- |
| [[Getting-Started]]       | Install, configure, and publish your first resume |
| [[Development]]           | Local workflow, scripts, and architecture         |
| [[Testing-and-Usability]] | Jest, Playwright, screenshots, and videos         |
| [[Deployment]]            | Firebase Hosting and static build                 |
| [[API-Reference]]         | HTTP endpoints and JSON payloads                  |
| [[Troubleshooting]]       | Common issues and fixes                           |
| [[Project-History]]       | Timeline from 2019 to platform hardening refactor |
| [[Releases]]              | Tagged releases including `working-messy-code`    |

## Screenshots

![Home page](https://raw.githubusercontent.com/benmed00/Online-PDF-CV/master/docs/assets/screenshots/01-home-desktop.png)

See [[Testing-and-Usability]] for the full visual walkthrough.

## License

Apache License 2.0
