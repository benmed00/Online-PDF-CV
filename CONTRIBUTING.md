# Contributing to Online-PDF-CV

Thank you for considering contributing to Online-PDF-CV! This document outlines the guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

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
4. Run the linter and formatter (`npm run lint && npm run format`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Code Style

This project uses ESLint and Prettier to enforce code style. Before submitting a pull request, make sure your code passes the linting and formatting checks:

```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Testing

Currently, this project does not have automated tests. When adding new features, please manually test them thoroughly.

## Documentation

When adding new features or making changes, please update the documentation accordingly:

- Update the README.md if necessary
- Add comments to your code
- Update any relevant documentation files

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [Apache License 2.0](LICENSE).
