#!/usr/bin/env node

/**
 * Script to export a resume to different formats
 * Usage: node scripts/export-resume.js <version-name> <format>
 * Example: node scripts/export-resume.js technical json
 *
 * Supported formats: json, txt, markdown
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Error: Please provide a version name and format');
  console.log('Usage: node scripts/export-resume.js <version-name> <format>');
  console.log('Example: node scripts/export-resume.js technical json');
  console.log('Supported formats: json, txt, markdown');
  process.exit(1);
}

const versionName = args[0];
const format = args[1].toLowerCase();

// Validate format
const supportedFormats = ['json', 'txt', 'markdown', 'md'];
if (!supportedFormats.includes(format)) {
  console.error(`Error: Unsupported format "${format}"`);
  console.log(`Supported formats: ${supportedFormats.join(', ')}`);
  process.exit(1);
}

// Normalize format (treat 'md' as 'markdown')
const normalizedFormat = format === 'md' ? 'markdown' : format;

// Check if the resume exists
const resumesDir = path.join(__dirname, '..', 'public', 'resumes');
const resumePath = path.join(resumesDir, `${versionName}.pdf`);
const defaultResumePath = path.join(__dirname, '..', 'public', 'resume.pdf');

let sourcePath;
if (fs.existsSync(resumePath)) {
  sourcePath = resumePath;
} else if (versionName === 'default' && fs.existsSync(defaultResumePath)) {
  sourcePath = defaultResumePath;
} else {
  console.error(`Error: Resume version "${versionName}" not found`);
  console.log('Available versions:');

  if (fs.existsSync(defaultResumePath)) {
    console.log('- default');
  }

  if (fs.existsSync(resumesDir)) {
    const files = fs.readdirSync(resumesDir);
    files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => file.replace('.pdf', ''))
      .forEach(version => {
        console.log(`- ${version}`);
      });
  }

  process.exit(1);
}

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Define output path
const outputPath = path.join(
  exportsDir,
  `${versionName}.${normalizedFormat === 'markdown' ? 'md' : normalizedFormat}`
);

// Check if we have the necessary tools
try {
  // For PDF text extraction, we'll use a simple approach
  // In a real-world scenario, you might want to use a more robust library like pdf-parse

  // Create a simple JSON structure for the resume
  if (normalizedFormat === 'json') {
    const resumeData = {
      version: versionName,
      source: sourcePath,
      exported_at: new Date().toISOString(),
      content: {
        // In a real implementation, you would extract structured data from the PDF
        // This is a simplified placeholder
        name: 'Resume Owner',
        title: 'Professional Title',
        contact: {
          email: 'email@example.com',
          phone: '123-456-7890',
        },
        sections: [
          {
            title: 'Summary',
            content: 'This is a placeholder for the resume summary.',
          },
          {
            title: 'Experience',
            content: 'This is a placeholder for work experience.',
          },
          {
            title: 'Education',
            content: 'This is a placeholder for education information.',
          },
          {
            title: 'Skills',
            content: 'This is a placeholder for skills.',
          },
        ],
      },
    };

    fs.writeFileSync(outputPath, JSON.stringify(resumeData, null, 2));
    console.log(`Resume exported to JSON: ${outputPath}`);
  }
  // Create a simple text version of the resume
  else if (normalizedFormat === 'txt') {
    // In a real implementation, you would extract text from the PDF
    // This is a simplified placeholder
    const textContent = `RESUME: ${versionName.toUpperCase()}
    
NAME: Resume Owner
TITLE: Professional Title
CONTACT: email@example.com | 123-456-7890

SUMMARY
This is a placeholder for the resume summary.

EXPERIENCE
This is a placeholder for work experience.

EDUCATION
This is a placeholder for education information.

SKILLS
This is a placeholder for skills.
`;

    fs.writeFileSync(outputPath, textContent);
    console.log(`Resume exported to text: ${outputPath}`);
  }
  // Create a simple markdown version of the resume
  else if (normalizedFormat === 'markdown') {
    // In a real implementation, you would extract content from the PDF
    // This is a simplified placeholder
    const markdownContent = `# Resume Owner
## Professional Title

**Contact:** email@example.com | 123-456-7890

### Summary
This is a placeholder for the resume summary.

### Experience
This is a placeholder for work experience.

### Education
This is a placeholder for education information.

### Skills
This is a placeholder for skills.
`;

    fs.writeFileSync(outputPath, markdownContent);
    console.log(`Resume exported to markdown: ${outputPath}`);
  }

  console.log('\nNote: This is a simplified export with placeholder content.');
  console.log(
    'In a real implementation, you would need to extract the actual content from the PDF.'
  );
} catch (error) {
  console.error('Error exporting resume:', error.message);
  process.exit(1);
}
