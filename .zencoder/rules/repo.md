---
description: Repository Information Overview
alwaysApply: true
---

# Online-PDF-CV Information

## Summary

An Express.js web application that serves a PDF resume with multiple versions. The application has been enhanced to support different resume formats, API endpoints, documentation, and a resume analyzer tool. It's optimized for simplicity and performance, serving PDF files as the main content with additional features for resume management. The live deployment is accessible at <https://benyakoub-cv.firebaseapp.com/>.

## Repository Architecture

### Core Structure

- **bin/**: Contains the server startup script (www) with HTTP server configuration
- **public/**: Static assets directory with the following components:
  - resume.pdf: The primary content served to users
  - index.html: HTML wrapper with Firebase SDK integration and PDF embedding
  - stylesheets/: CSS styling for the application interface
  - favicon.ico: Browser tab icon
- **routes/**: Express.js route definitions (index.js, users.js)
- **views/**: Jade template files (layout.jade, index.jade, error.jade)
- **.github/workflows/**: CI/CD automation for Firebase deployment
- **.firebase/**: Firebase deployment cache and hosting configuration

### Configuration Files

- **package.json**: Node.js project configuration and dependency management
- **firebase.json**: Firebase hosting configuration with public directory mapping
- **.firebaserc**: Firebase project association (benyakoub-cv)
- **app.js**: Express application configuration and middleware setup

## Technical Specifications

### Language & Runtime

**Primary Language**: JavaScript (Node.js)
**Runtime Version**: Node.js >=16.17.1 (specified in engines field)
**Framework**: Express.js 4.20.0
**Package Manager**: npm
**Template Engine**: Jade 1.11.0 (legacy template system)
**Deployment Target**: Firebase Hosting static platform

### Dependencies Analysis

**Production Dependencies**:

- express: ^4.20.0 - Web framework providing robust routing and middleware architecture
- jade: ~1.11.0 - Template engine for server-rendered views (minimally utilized)
- cookie-parser: ^1.4.6 - HTTP cookie parsing middleware for session management
- debug: ^4.3.4 - Debugging utility with namespace support for selective debugging
- http-errors: ^2.0.0 - HTTP-friendly error objects with status codes
- morgan: ^1.10.1 - HTTP request logger middleware for access logging

**Development Dependencies**: None explicitly defined

**Client-Side Dependencies**:

- Firebase SDK (9.12.1) - Loaded via CDN for analytics and potential future features
- Google Analytics - For visitor tracking and usage statistics

### Server Configuration

**Local Server**:

- **Port Assignment**: Uses environment variable PORT or defaults to 3000
- **Error Handling**: Custom error middleware with development/production mode detection
- **Static File Serving**: Express static middleware for public directory
- **Route Override**: Wildcard route (\*) to serve resume.pdf for all paths
- **HTTP Server**: Node.js native http module with custom error handlers

**Firebase Hosting**:

- **Public Directory**: ./public
- **Rewrite Rules**: All requests rewritten to /index.html
- **Ignore Patterns**: Excludes firebase.json, hidden files, and node_modules
- **Cache Control**: Default Firebase caching strategy

## Deployment & CI/CD Pipeline

### Local Development

```bash
# Installation
npm install

# Development server
npm start  # Runs node ./bin/www
```

### Firebase Deployment

**Manual Deployment**:

```bash
# Login to Firebase
firebase login

# Deploy to Firebase
npm run deploy  # Runs firebase deploy
```

**Automated Deployment**:

- **Trigger**: Push to master branch
- **Environment**: Ubuntu latest
- **Build Steps**:
  1. Checkout code (actions/checkout@v2)
  2. Install dependencies (npm ci)
  3. Run build process (npm run build) - Note: Currently empty in package.json
  4. Deploy to Firebase (FirebaseExtended/action-hosting-deploy@v0)
- **Authentication**: Uses GitHub secrets for Firebase service account
- **Channel**: Production (live)
- **Project ID**: benyakoub-cv-8b145

### Pull Request Preview

- **Trigger**: Pull request to master
- **Condition**: Only runs on PRs from same repository
- **Preview**: Creates temporary Firebase hosting channel for review

## Application Architecture

### Request Flow

1. **HTTP Request**: Client requests any URL path
2. **Express Routing**: Wildcard route (\*) intercepts all requests
3. **Response**: Server sends resume.pdf regardless of requested path
4. **Alternative Flow**: When deployed to Firebase, the static hosting serves index.html which embeds the PDF

### Client-Side Implementation

**PDF Embedding**:

```html
<embed
  type="application/pdf"
  src="resume.pdf"
  frameBorder="0"
  scrolling="auto"
  height="1000px"
  width="100%"
  class="responsive"
/>
```

**Analytics Integration**:

- Google Analytics 4 property (G-FXM60PGSZP)
- Custom page view tracking
- Firebase Analytics integration capability

**Firebase SDK Integration**:

- Firebase App (core)
- Authentication
- Realtime Database
- Firestore
- Cloud Functions
- Cloud Messaging
- Cloud Storage
- Analytics
- Remote Config
- Performance Monitoring

## Security & Compliance

### License

**Type**: Apache License 2.0
**Key Permissions**:

- Commercial use
- Modification
- Distribution
- Patent use
- Private use

### Security Policy

**File**: SECURITY.md
**Supported Versions**:

- 5.1.x: ✓
- 5.0.x: ✗
- 4.0.x: ✓
- < 4.0: ✗

### Deployment History

**Last Deployment**:

- index.html: 1721698828490
- resume.pdf: 1721699756398 (most recent file update)

## Advanced Usage & Customization

### Custom Resume Integration

1. Replace the PDF file at public/resume.pdf with your own resume
2. Customize the HTML title in public/index.html:

   ```html
   <title id="title">Hi, I am BEN-YAKOUB. feel free to download ...</title>
   ```

3. Optionally modify the embed tag parameters for different display options:

   ```html
   <embed
     type="application/pdf"
     src="resume.pdf"
     frameBorder="0"
     scrolling="auto"
     height="1000px"  <!-- Adjust height as needed -->
     width="100%"     <!-- Responsive width -->
     class="responsive">
   ```

### Firebase Project Setup

1. Create a Firebase project at <https://console.firebase.google.com/>
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Login to Firebase: `firebase login`
4. Initialize project: `firebase init hosting`
5. Update .firebaserc with your project ID
6. Deploy: `firebase deploy` or `npm run deploy`

### Analytics Configuration

1. Create a Google Analytics 4 property
2. Replace the measurement ID in index.html:

   ```html
   gtag('config', 'G-FXM60PGSZP');
   <!-- Replace with your measurement ID -->
   ```

### Custom Domain Setup

1. Configure a custom domain in Firebase Hosting console
2. Verify domain ownership
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning
