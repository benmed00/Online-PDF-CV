const fs = require('fs');
const path = require('path');
const {
  resolveResumePdfPath,
  extractHostedResumeVersion,
} = require('../utils/extractResumeVersion');

jest.mock('../utils/virusTotalScanner', () => ({
  scanUploadedFile: jest.fn().mockResolvedValue({
    scanned: false,
    skipped: true,
    reason: 'test',
  }),
}));

jest.mock('../utils/extractResumeText', () => ({
  extractResumeText: jest.fn().mockResolvedValue({
    text: 'Extracted resume text from PDF with JavaScript skills.',
    kind: 'officeparser',
    fileType: 'pdf',
  }),
}));

describe('extractResumeVersion', () => {
  const resumesDir = path.join(__dirname, '..', 'public', 'resumes');

  test('resolveResumePdfPath finds default.pdf', () => {
    if (!fs.existsSync(path.join(resumesDir, 'default.pdf'))) {
      return;
    }
    const resolved = resolveResumePdfPath('default');
    expect(resolved).not.toBeNull();
    expect(resolved.filename).toMatch(/\.pdf$/);
  });

  test('extractHostedResumeVersion returns text', async () => {
    if (!fs.existsSync(path.join(resumesDir, 'default.pdf'))) {
      return;
    }
    const result = await extractHostedResumeVersion('default');
    expect(result.success).toBe(true);
    expect(result.text).toContain('JavaScript');
    expect(result.source.version).toBe('default');
  });

  test('invalid version throws', async () => {
    await expect(extractHostedResumeVersion('bad slug!')).rejects.toThrow(/Invalid/);
  });
});
