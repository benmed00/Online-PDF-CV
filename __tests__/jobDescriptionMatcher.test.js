const {
  extractRequirements,
  matchResumeToJob,
  MAX_JOB_DESCRIPTION_CHARS,
} = require('../utils/jobDescriptionMatcher');

describe('jobDescriptionMatcher', () => {
  const jobDescription =
    'Required skills: JavaScript and React experience. ' +
    'Qualifications include AWS cloud knowledge and strong communication skills. ' +
    'Must have 3+ years experience with Node.js.';

  const resume =
    'Software engineer with JavaScript, React, and Node.js experience. ' +
    'Strong communication and teamwork skills.';

  test('extractRequirements finds phrases from job description', () => {
    const reqs = extractRequirements(jobDescription);
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs.length).toBeLessThanOrEqual(15);
  });

  test('matchResumeToJob scores overlap', () => {
    const result = matchResumeToJob(resume, jobDescription);
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.foundRequirements.length).toBeGreaterThan(0);
    expect(Array.isArray(result.missingRequirements)).toBe(true);
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  test('empty job description yields zero score', () => {
    const result = matchResumeToJob(resume, '');
    expect(result.overallScore).toBe(0);
    expect(result.requirementCount).toBe(0);
  });

  test('MAX_JOB_DESCRIPTION_CHARS is exported', () => {
    expect(MAX_JOB_DESCRIPTION_CHARS).toBe(8000);
  });
});
