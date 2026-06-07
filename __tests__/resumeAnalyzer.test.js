const { analyzeResume, validateText, LIMITS } = require('../utils/resumeAnalyzer');

const SAMPLE =
  'Jane Developer — jane@email.com | (555) 123-4567 | linkedin.com/in/jane\n\n' +
  'SUMMARY\nExperienced engineer with JavaScript, React, Node, AWS, Docker, CI/CD.\n\n' +
  'EXPERIENCE\nSenior Engineer — TechCorp | 2020 – Present\n' +
  '• Led team of 6, built microservices reducing latency 40%\n' +
  '• Implemented API and SQL optimizations improving performance 35%\n\n' +
  'SKILLS\nJavaScript, Python, React, leadership, communication, project management\n\n' +
  'EDUCATION\nB.S. Computer Science — University | 2016';

describe('resumeAnalyzer', () => {
  describe('validateText', () => {
    test('rejects empty text', () => {
      const result = validateText('');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY');
    });

    test('rejects text below minimum length', () => {
      const result = validateText('Too short resume text here.');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TOO_SHORT')).toBe(true);
    });

    test('accepts valid resume text', () => {
      const result = validateText(SAMPLE);
      expect(result.valid).toBe(true);
      expect(result.charCount).toBeGreaterThan(LIMITS.minChars);
      expect(result.wordCount).toBeGreaterThan(LIMITS.minWords);
    });
  });

  describe('analyzeResume', () => {
    test('returns error for invalid input', () => {
      const result = analyzeResume('short');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('returns scores and matches for valid resume', () => {
      const result = analyzeResume(SAMPLE);
      expect(result.success).toBe(true);
      expect(result.results.technicalScore).toBeGreaterThan(0);
      expect(result.results.softSkillsScore).toBeGreaterThan(0);
      expect(result.results.overallScore).toBeGreaterThan(0);
      expect(result.results.matches.technical.length).toBeGreaterThan(0);
    });

    test('includes best-practice checks', () => {
      const result = analyzeResume(SAMPLE);
      expect(result.checks.length).toBeGreaterThan(5);
      expect(result.checks.some(c => c.id === 'action-verbs')).toBe(true);
      expect(result.checks.some(c => c.id === 'contact' && c.passed)).toBe(true);
    });

    test('generates suggestions', () => {
      const result = analyzeResume(SAMPLE);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('supports target role option', () => {
      const result = analyzeResume(SAMPLE, { targetRole: 'engineering' });
      expect(result.meta.targetRole).toBe('engineering');
    });
  });
});
