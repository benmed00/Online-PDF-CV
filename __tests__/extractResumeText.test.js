const {
  extractResumeText,
  getFormatInfo,
  SUPPORTED_EXTENSIONS,
} = require('../utils/extractResumeText');
const AppError = require('../utils/AppError');

describe('extractResumeText', () => {
  test('lists supported extensions', () => {
    expect(SUPPORTED_EXTENSIONS).toContain('.docx');
    expect(SUPPORTED_EXTENSIONS).toContain('.png');
    expect(SUPPORTED_EXTENSIONS).toContain('.md');
  });

  test('getFormatInfo returns null for unknown extension', () => {
    expect(getFormatInfo('resume.xyz')).toBeNull();
  });

  test('extracts plain text files', async () => {
    const buffer = Buffer.from(
      'Jane Developer — jane@email.com\n\nEXPERIENCE\nBuilt JavaScript React Node AWS applications with leadership skills.',
      'utf8'
    );
    const result = await extractResumeText(buffer, 'resume.txt');
    expect(result.text).toContain('JavaScript');
    expect(result.source.extension).toBe('.txt');
    expect(result.source.charCount).toBeGreaterThan(20);
  });

  test('extracts markdown files', async () => {
    const buffer = Buffer.from(
      '# Jane Dev\n\n- JavaScript, React, AWS\n- Strong **communication** and leadership',
      'utf8'
    );
    const result = await extractResumeText(buffer, 'resume.md');
    expect(result.text).toContain('JavaScript');
    expect(result.source.fileType).toBe('md');
  });

  test('extracts HTML files', async () => {
    const buffer = Buffer.from(
      '<html><body><h1>Jane Dev</h1><p>JavaScript React AWS Docker CI/CD</p></body></html>',
      'utf8'
    );
    const result = await extractResumeText(buffer, 'resume.html');
    expect(result.text).toContain('Jane Dev');
    expect(result.text).toContain('JavaScript');
  });

  test('rejects unsupported extensions', async () => {
    await expect(extractResumeText(Buffer.from('data'), 'file.xyz')).rejects.toBeInstanceOf(
      AppError
    );
  });

  test('rejects empty extraction', async () => {
    await expect(extractResumeText(Buffer.from('   '), 'empty.txt')).rejects.toBeInstanceOf(
      AppError
    );
  });

  test('rejects legacy xls with helpful message', async () => {
    await expect(extractResumeText(Buffer.from('data'), 'old.xls')).rejects.toMatchObject({
      message: expect.stringContaining('.xlsx'),
    });
  });
});
