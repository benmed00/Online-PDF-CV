#!/usr/bin/env node

/**
 * Script to create a new resume version template
 * Usage: node scripts/create-resume-template.js <version-name>
 * Example: node scripts/create-resume-template.js technical
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('Error: Please provide a version name');
  console.log('Usage: node scripts/create-resume-template.js <version-name>');
  console.log('Example: node scripts/create-resume-template.js technical');
  process.exit(1);
}

const versionName = args[0];

// Validate version name
if (!/^[a-z0-9-]+$/.test(versionName)) {
  console.error('Error: Version name must contain only lowercase letters, numbers, and hyphens');
  process.exit(1);
}

// Create resumes directory if it doesn't exist
const resumesDir = path.join(__dirname, '..', 'public', 'resumes');
if (!fs.existsSync(resumesDir)) {
  console.log(`Creating directory: ${resumesDir}`);
  fs.mkdirSync(resumesDir, { recursive: true });
}

// Check if version already exists
const destPath = path.join(resumesDir, `${versionName}.pdf`);
if (fs.existsSync(destPath)) {
  console.error(`Error: Resume version "${versionName}" already exists at ${destPath}`);
  console.log('Please choose a different version name or delete the existing file first.');
  process.exit(1);
}

// Create a simple HTML template for the resume
const templateDir = path.join(__dirname, '..', 'templates');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

const templatePath = path.join(templateDir, `${versionName}-template.html`);
const templateContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${versionName.charAt(0).toUpperCase() + versionName.slice(1)} Resume Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .contact-info {
      margin-bottom: 20px;
    }
    
    section {
      margin-bottom: 30px;
    }
    
    h2 {
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    
    .job {
      margin-bottom: 20px;
    }
    
    .job-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .job-company {
      font-style: italic;
    }
    
    .job-date {
      float: right;
      color: #666;
    }
    
    ul {
      padding-left: 20px;
    }
    
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .skill {
      background-color: #f0f0f0;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 14px;
    }
    
    footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 50px;
    }
  </style>
</head>
<body>
  <header>
    <h1>YOUR NAME</h1>
    <div class="contact-info">
      <p>Email: your.email@example.com | Phone: (123) 456-7890 | Location: City, State</p>
      <p>LinkedIn: linkedin.com/in/yourprofile | GitHub: github.com/yourusername</p>
    </div>
  </header>
  
  <section>
    <h2>Summary</h2>
    <p>
      Experienced professional with X years of expertise in [field]. Skilled in [key skills] with a proven track record of [achievements]. Seeking to leverage my skills in [target role or industry].
    </p>
  </section>
  
  <section>
    <h2>Experience</h2>
    
    <div class="job">
      <div class="job-title">Job Title <span class="job-company">at Company Name</span> <span class="job-date">Month Year - Present</span></div>
      <ul>
        <li>Accomplishment or responsibility that demonstrates your skills and impact</li>
        <li>Quantifiable achievement with metrics (e.g., increased efficiency by 20%)</li>
        <li>Project or initiative you led or contributed to significantly</li>
      </ul>
    </div>
    
    <div class="job">
      <div class="job-title">Previous Job Title <span class="job-company">at Previous Company</span> <span class="job-date">Month Year - Month Year</span></div>
      <ul>
        <li>Key responsibility or achievement relevant to your target role</li>
        <li>Specific contribution that showcases your expertise</li>
        <li>Collaborative effort that highlights your teamwork skills</li>
      </ul>
    </div>
  </section>
  
  <section>
    <h2>Education</h2>
    <p><strong>Degree Name</strong> - University Name, Graduation Year</p>
    <p>Relevant coursework: Course 1, Course 2, Course 3</p>
    <p>Honors or achievements: Honor 1, Honor 2</p>
  </section>
  
  <section>
    <h2>Skills</h2>
    <div class="skills">
      <span class="skill">Skill 1</span>
      <span class="skill">Skill 2</span>
      <span class="skill">Skill 3</span>
      <span class="skill">Skill 4</span>
      <span class="skill">Skill 5</span>
      <span class="skill">Skill 6</span>
      <span class="skill">Skill 7</span>
      <span class="skill">Skill 8</span>
    </div>
  </section>
  
  <section>
    <h2>Projects</h2>
    <p><strong>Project Name</strong> - Brief description of the project, your role, and the technologies used.</p>
    <p><strong>Another Project</strong> - Description of another relevant project that showcases your skills.</p>
  </section>
  
  <section>
    <h2>Certifications</h2>
    <p>Certification Name - Issuing Organization, Year</p>
    <p>Another Certification - Issuing Organization, Year</p>
  </section>
  
  <footer>
    References available upon request
  </footer>
</body>
</html>`;

fs.writeFileSync(templatePath, templateContent);

console.log(`Success! Resume template for "${versionName}" created at: ${templatePath}`);
console.log('\nNext steps:');
console.log('1. Edit the template with your information');
console.log('2. Convert the HTML to PDF using a browser or online converter');
console.log('3. Add the PDF to your resume collection using:');
console.log(`   npm run add-version -- path/to/converted/${versionName}.pdf ${versionName}`);
