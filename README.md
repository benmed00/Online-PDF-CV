# Online-PDF-CV

A simple and elegant way to host your PDF resume online with Firebase.  
Live demo: [https://benyakoub-cv.firebaseapp.com/](https://benyakoub-cv.firebaseapp.com/)

## Technologies Used

- **JavaScript**: [https://www.javascript.com/](https://www.javascript.com/)
- **Node.js**: [https://nodejs.org](https://nodejs.org)
- **Express.js**: [https://expressjs.com](https://expressjs.com)
- **Git**: [https://git-scm.com](https://git-scm.com)
- **Firebase**: [https://firebase.google.com](https://firebase.google.com)
- **Firebase CLI**: [https://www.npmjs.com/package/firebase-tools](https://www.npmjs.com/package/firebase-tools)

## Code Quality Tools

This project uses the following tools to ensure code quality and consistent formatting:

- **ESLint**: JavaScript linting tool to identify and report on patterns in the code
- **Prettier**: Code formatter that enforces a consistent style

### Available Scripts

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Deploy to Firebase
npm run deploy
```

## Features

- **Multiple Resume Versions**: Host different versions of your resume (technical, executive, creative) accessible via different URLs
- **API Documentation**: Interactive documentation page at `/docs` explaining how to use the resume API
- **Resume Analyzer**: Tool at `/analyzer` to analyze resume content and provide improvement suggestions
- **Resume Comparison**: Tool at `/compare` to compare different resume versions side by side
- **Resume Templates**: HTML templates for creating different resume versions
- **Format Export**: Export your resume to different formats (JSON, TXT, Markdown)
- **Testing**: Jest testing framework with test coverage reporting
- **CI/CD**: GitHub Actions workflows for continuous integration and deployment

## How to Use

Follow these steps to host your own PDF resume:

1. Clone this repository
2. Navigate to the `public` folder
3. Replace the existing `resume.pdf` with your own PDF file (make sure to name it `resume.pdf`)
4. Add different versions of your resume to the `public/resumes` folder (e.g., `technical.pdf`, `executive.pdf`)
5. Customize the title and navigation in the layout template if desired
6. Deploy to Firebase (see deployment instructions below)

### Creating Resume Templates

You can create HTML templates for different resume versions:

```bash
# Create a new resume template
npm run create-template -- version-name

# Examples:
npm run create-template -- technical
npm run create-template -- executive
npm run create-template -- creative
```

This will create an HTML template in the `templates` directory that you can customize and then convert to PDF.

### Adding Resume Versions

You can add different versions of your resume using the provided script:

```bash
# Add a new resume version
npm run add-version -- /path/to/your/resume.pdf version-name

# Examples:
npm run add-version -- ~/Documents/technical-resume.pdf technical
npm run add-version -- ~/Documents/executive-resume.pdf executive
```

This will copy your PDF file to the `public/resumes` directory with the specified version name, making it accessible at `/resume/version-name`.

### Generating a Sitemap

To improve SEO, you can generate a sitemap.xml file for your resume site:

```bash
# Generate sitemap.xml
npm run generate-sitemap -- https://yourdomain.com

# Example:
npm run generate-sitemap -- https://resume.example.com
```

This will create a `sitemap.xml` file in the `public` directory that includes:

- The main resume page
- All resume versions
- The documentation page
- The resume analyzer tool

The sitemap will help search engines discover and index all pages of your resume site.

### Exporting to Different Formats

You can export your resume to different formats for various use cases:

```bash
# Export a resume version to a different format
npm run export -- <version-name> <format>

# Examples:
npm run export -- technical json
npm run export -- executive txt
npm run export -- creative markdown
```

Supported formats:

- `json`: Structured data format for programmatic use
- `txt`: Plain text format for simple viewing
- `markdown` (or `md`): Markdown format for easy editing and GitHub display

The exported files will be saved in the `exports` directory.

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm start
```

## Code Quality

```bash
# Run ESLint to check code quality
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

## Deployment

### Prerequisites

- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)

### Steps

1. Login to Firebase: `firebase login`
2. Initialize Firebase (first time only): `firebase init hosting`
3. Deploy to Firebase: `npm run deploy`

### Continuous Deployment

This project is configured with GitHub Actions for continuous deployment:

- Pushes to the master branch automatically deploy to Firebase
- Pull requests create preview deployments

## Firebase Setup

Firebase offers free hosting for small applications:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Follow the setup instructions to connect your local project to Firebase
3. Update the `.firebaserc` file with your project ID

## Resources

- **Create a professional CV online**: [CVmaker](https://www.cvmaker.fr/)
- **Firebase Documentation**: [Firebase Hosting](https://firebase.google.com/docs/hosting)
- **Express.js Documentation**: [Express Guide](https://expressjs.com/en/guide/routing.html)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
