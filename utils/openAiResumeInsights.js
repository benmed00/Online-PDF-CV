const logger = require('./logger');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_RESUME_CHARS = 12000;

const TARGET_LABELS = {
  engineering: 'Software Engineering',
  management: 'Management / Leadership',
  general: 'General / Mixed',
};

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function buildSystemPrompt() {
  return [
    'You are an expert resume coach and ATS (Applicant Tracking System) specialist.',
    'Analyze the resume text for clarity, impact, keyword coverage, and formatting signals.',
    'Respond with valid JSON only — no markdown fences — using this schema:',
    '{',
    '  "summary": "string (2-3 sentences)",',
    '  "strengths": ["string"],',
    '  "improvements": ["string"],',
    '  "atsTips": ["string"],',
    '  "missingKeywords": ["string"],',
    '  "scoreEstimate": number (1-100, overall resume quality for the target role)',
    '}',
    'Be specific and actionable. Do not invent experience not present in the text.',
  ].join(' ');
}

function parseJsonContent(content) {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    : trimmed;

  const parsed = JSON.parse(jsonText);

  return {
    summary: String(parsed.summary || '').trim(),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
    atsTips: Array.isArray(parsed.atsTips) ? parsed.atsTips.map(String) : [],
    missingKeywords: Array.isArray(parsed.missingKeywords)
      ? parsed.missingKeywords.map(String)
      : [],
    scoreEstimate:
      typeof parsed.scoreEstimate === 'number'
        ? Math.min(100, Math.max(1, Math.round(parsed.scoreEstimate)))
        : null,
  };
}

/**
 * Optional OpenAI-powered resume insights (requires OPENAI_API_KEY).
 * @param {string} text
 * @param {string} targetRole
 * @returns {Promise<object>}
 */
async function getAiResumeInsights(text, targetRole = 'general') {
  if (!isConfigured()) {
    return { available: false, skipped: true, reason: 'OPENAI_API_KEY not configured' };
  }

  const resumeText = text.trim().slice(0, MAX_RESUME_CHARS);
  const roleLabel = TARGET_LABELS[targetRole] || TARGET_LABELS.general;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: `Target role: ${roleLabel}\n\nResume text:\n${resumeText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    logger.warn('OpenAI resume insights failed', { status: response.status, detail });
    throw new Error('AI analysis is temporarily unavailable. Local results are still shown.');
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI analysis returned an empty response.');
  }

  const insights = parseJsonContent(content);

  return {
    available: true,
    ...insights,
    model,
    targetRole,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  getAiResumeInsights,
  isConfigured,
  parseJsonContent,
  MAX_RESUME_CHARS,
};
