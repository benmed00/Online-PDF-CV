const {
  getAiResumeInsights,
  isConfigured,
  parseJsonContent,
} = require('../utils/openAiResumeInsights');

describe('openAiResumeInsights', () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  test('isConfigured reflects env var', () => {
    delete process.env.OPENAI_API_KEY;
    expect(isConfigured()).toBe(false);
    process.env.OPENAI_API_KEY = 'sk-test';
    expect(isConfigured()).toBe(true);
  });

  test('skips when API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await getAiResumeInsights('resume text here', 'general');
    expect(result.available).toBe(false);
    expect(result.skipped).toBe(true);
  });

  test('returns parsed insights from OpenAI', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Solid engineering resume.',
                strengths: ['Clear metrics'],
                improvements: ['Add more keywords'],
                atsTips: ['Use standard headings'],
                missingKeywords: ['TypeScript'],
                scoreEstimate: 78,
              }),
            },
          },
        ],
      }),
    });

    const result = await getAiResumeInsights(
      'Engineer with JavaScript React AWS experience and leadership skills for testing.',
      'engineering'
    );

    expect(result.available).toBe(true);
    expect(result.summary).toContain('engineering');
    expect(result.strengths).toHaveLength(1);
    expect(result.scoreEstimate).toBe(78);
  });

  test('parseJsonContent handles fenced JSON', () => {
    const parsed = parseJsonContent(
      '```json\n{"summary":"Hi","strengths":[],"improvements":[],"atsTips":[],"missingKeywords":[],"scoreEstimate":50}\n```'
    );
    expect(parsed.summary).toBe('Hi');
    expect(parsed.scoreEstimate).toBe(50);
  });
});
