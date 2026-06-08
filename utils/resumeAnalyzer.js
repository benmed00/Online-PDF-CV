/**
 * Resume analysis engine — keyword scoring, validation, and best-practice checks.
 */

const LIMITS = {
  minChars: 80,
  maxChars: 20000,
  minWords: 40,
  idealWordsMin: 250,
  idealWordsMax: 900,
};

const KEYWORDS = {
  technical: [
    'javascript',
    'typescript',
    'python',
    'java',
    'react',
    'node',
    'aws',
    'cloud',
    'docker',
    'kubernetes',
    'devops',
    'ci/cd',
    'microservices',
    'api',
    'database',
    'sql',
    'nosql',
    'git',
    'agile',
    'scrum',
  ],
  soft: [
    'leadership',
    'communication',
    'teamwork',
    'problem-solving',
    'critical thinking',
    'adaptability',
    'time management',
    'creativity',
    'collaboration',
    'work ethic',
    'interpersonal',
    'negotiation',
  ],
  management: [
    'project management',
    'team lead',
    'manager',
    'director',
    'strategy',
    'budget',
    'planning',
    'kpi',
    'metrics',
    'performance',
    'hiring',
    'mentoring',
    'coaching',
    'stakeholder',
  ],
};

const ACTION_VERBS = [
  'achieved',
  'built',
  'created',
  'delivered',
  'designed',
  'developed',
  'drove',
  'enhanced',
  'implemented',
  'improved',
  'increased',
  'launched',
  'led',
  'managed',
  'optimized',
  'reduced',
  'resolved',
  'spearheaded',
  'streamlined',
  'transformed',
];

const WEAK_PHRASES = [
  'responsible for',
  'duties included',
  'helped with',
  'worked on',
  'involved in',
  'assisted with',
];

const SECTION_HINTS = [
  {
    id: 'experience',
    label: 'Experience',
    patterns: [/experience/i, /employment/i, /work history/i],
  },
  { id: 'education', label: 'Education', patterns: [/education/i, /degree/i, /university/i] },
  { id: 'skills', label: 'Skills', patterns: [/skills/i, /technologies/i, /competencies/i] },
  {
    id: 'summary',
    label: 'Summary',
    patterns: [/summary/i, /profile/i, /objective/i, /about me/i],
  },
];

const TARGET_ROLES = {
  engineering: { boost: ['technical'], label: 'Software Engineering' },
  management: { boost: ['management', 'soft'], label: 'Management / Leadership' },
  general: { boost: ['technical', 'soft', 'management'], label: 'General / Mixed' },
};

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function calculateScore(text, keywords) {
  let matches = 0;
  keywords.forEach(keyword => {
    if (text.includes(keyword)) matches++;
  });
  return Math.round((matches / keywords.length) * 100);
}

function findMatches(text) {
  const matches = { technical: [], soft: [], management: [] };
  Object.keys(KEYWORDS).forEach(category => {
    KEYWORDS[category].forEach(keyword => {
      if (text.includes(keyword)) matches[category].push(keyword);
    });
  });
  return matches;
}

function validateText(text) {
  const errors = [];
  const warnings = [];

  if (!text || !text.trim()) {
    errors.push({ code: 'EMPTY', message: 'Please paste your resume text before analyzing.' });
    return { valid: false, errors, warnings };
  }

  const trimmed = text.trim();
  const charCount = trimmed.length;
  const wordCount = countWords(trimmed);

  if (charCount < LIMITS.minChars) {
    errors.push({
      code: 'TOO_SHORT',
      message: `Resume is too short (${charCount} chars). Add at least ${LIMITS.minChars} characters for meaningful analysis.`,
    });
  }

  if (charCount > LIMITS.maxChars) {
    errors.push({
      code: 'TOO_LONG',
      message: `Resume exceeds the ${LIMITS.maxChars.toLocaleString()} character limit.`,
    });
  }

  if (wordCount < LIMITS.minWords) {
    warnings.push({
      code: 'LOW_WORD_COUNT',
      message: `Only ${wordCount} words detected — most resumes need ${LIMITS.minWords}+ words.`,
    });
  }

  return { valid: errors.length === 0, errors, warnings, charCount, wordCount };
}

function runBestPracticeChecks(text) {
  const lower = text.toLowerCase();
  const checks = [];

  const actionVerbMatches = ACTION_VERBS.filter(v => lower.includes(v));
  checks.push({
    id: 'action-verbs',
    label: 'Action verbs',
    passed: actionVerbMatches.length >= 3,
    score: Math.min(100, Math.round((actionVerbMatches.length / 5) * 100)),
    hint:
      actionVerbMatches.length >= 3
        ? `Found ${actionVerbMatches.length} strong verbs (e.g. ${actionVerbMatches.slice(0, 3).join(', ')})`
        : 'Start bullet points with verbs like Led, Built, Delivered, or Optimized.',
    found: actionVerbMatches,
  });

  const quantified = (text.match(/\d+[%kKmMbB]?|\$\d+|#\d+/g) || []).length;
  checks.push({
    id: 'metrics',
    label: 'Quantified results',
    passed: quantified >= 2,
    score: Math.min(100, quantified * 25),
    hint:
      quantified >= 2
        ? `Found ${quantified} measurable achievements — great for ATS scanners.`
        : 'Add numbers: team size, revenue impact, performance gains, or deadlines met.',
    found: quantified,
  });

  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text);
  checks.push({
    id: 'contact',
    label: 'Contact information',
    passed: hasEmail || hasPhone,
    score: [hasEmail, hasPhone, hasLinkedIn].filter(Boolean).length * 33,
    hint: [
      hasEmail ? 'Email found' : 'Add a professional email',
      hasPhone ? 'Phone found' : 'Add a phone number',
      hasLinkedIn ? 'LinkedIn found' : 'Consider adding LinkedIn URL',
    ].join(' · '),
    found: { email: hasEmail, phone: hasPhone, linkedin: hasLinkedIn },
  });

  SECTION_HINTS.forEach(section => {
    const found = section.patterns.some(p => p.test(text));
    checks.push({
      id: section.id,
      label: `${section.label} section`,
      passed: found,
      score: found ? 100 : 0,
      hint: found
        ? `${section.label} section detected — good structure.`
        : `Add a clear "${section.label}" heading to help recruiters scan quickly.`,
    });
  });

  const hasBullets = /(^|\n)\s*[-•*–]\s/m.test(text) || /(^|\n)\s*\d+\.\s/m.test(text);
  checks.push({
    id: 'formatting',
    label: 'Bullet formatting',
    passed: hasBullets,
    score: hasBullets ? 100 : 40,
    hint: hasBullets
      ? 'Bullet points improve readability and ATS parsing.'
      : 'Use bullet points (- or •) for achievements instead of dense paragraphs.',
  });

  const wordCount = countWords(text);
  const lengthOk = wordCount >= LIMITS.idealWordsMin && wordCount <= LIMITS.idealWordsMax;
  checks.push({
    id: 'length',
    label: 'Resume length',
    passed: lengthOk,
    score: lengthOk ? 100 : wordCount < LIMITS.idealWordsMin ? 50 : 70,
    hint: lengthOk
      ? `${wordCount} words — within the ideal ${LIMITS.idealWordsMin}–${LIMITS.idealWordsMax} range.`
      : wordCount < LIMITS.idealWordsMin
        ? `${wordCount} words — consider expanding with more detail.`
        : `${wordCount} words — may be too long; trim to one page if possible.`,
  });

  const weakFound = WEAK_PHRASES.filter(p => lower.includes(p));
  checks.push({
    id: 'passive-voice',
    label: 'Strong phrasing',
    passed: weakFound.length === 0,
    score: weakFound.length === 0 ? 100 : Math.max(0, 100 - weakFound.length * 25),
    hint:
      weakFound.length === 0
        ? 'No weak filler phrases detected.'
        : `Replace passive phrases: "${weakFound.join('", "')}".`,
    found: weakFound,
  });

  const datePatterns = text.match(/\b(19|20)\d{2}\s*[-–—]\s*(present|(19|20)\d{2})\b/gi) || [];
  checks.push({
    id: 'dates',
    label: 'Employment dates',
    passed: datePatterns.length >= 1,
    score: Math.min(100, datePatterns.length * 50),
    hint:
      datePatterns.length >= 1
        ? 'Employment dates detected — helps verify career timeline.'
        : 'Include date ranges (e.g. 2020 – Present) for each role.',
  });

  return checks;
}

function generateSuggestions(results, checks, targetRole) {
  const suggestions = [];

  if (results.technicalScore < 30) {
    suggestions.push({
      type: 'improvement',
      text: 'Highlight more technical skills relevant to your target role.',
    });
  }
  if (results.softSkillsScore < 30) {
    suggestions.push({
      type: 'improvement',
      text: 'Emphasize soft skills with concrete examples (leadership, communication).',
    });
  }
  if (results.managementScore < 20) {
    suggestions.push({
      type: 'tip',
      text: 'If you have leadership experience, quantify team size and outcomes.',
    });
  }

  const scores = [results.technicalScore, results.softSkillsScore, results.managementScore];
  if (Math.max(...scores) - Math.min(...scores) > 50) {
    suggestions.push({
      type: 'balance',
      text: 'Your skill profile looks unbalanced — diversify technical, soft, and leadership signals.',
    });
  }

  checks
    .filter(c => !c.passed)
    .forEach(c => {
      suggestions.push({ type: 'practice', text: c.hint });
    });

  if (targetRole && TARGET_ROLES[targetRole]) {
    const role = TARGET_ROLES[targetRole];
    role.boost.forEach(cat => {
      const scoreKey =
        cat === 'technical'
          ? 'technicalScore'
          : cat === 'soft'
            ? 'softSkillsScore'
            : 'managementScore';
      if (results[scoreKey] < 50) {
        suggestions.push({
          type: 'role',
          text: `For ${role.label} roles, strengthen your ${cat.replace('management', 'leadership')} keywords.`,
        });
      }
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'success',
      text: 'Your resume looks well-balanced! Fine-tune for each job posting.',
    });
  }

  return suggestions;
}

function scoreGrade(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'needs-work';
}

/**
 * Analyze resume text.
 * @param {string} text
 * @param {{ targetRole?: string }} [options]
 * @returns {Object}
 */
function analyzeResume(text, options = {}) {
  const validation = validateText(text);

  if (!validation.valid) {
    return {
      success: false,
      validation,
      error: validation.errors[0]?.message || 'Invalid resume text',
    };
  }

  const trimmed = text.trim();
  const lowercaseText = trimmed.toLowerCase();
  const matches = findMatches(lowercaseText);

  const technicalScore = calculateScore(lowercaseText, KEYWORDS.technical);
  const softSkillsScore = calculateScore(lowercaseText, KEYWORDS.soft);
  const managementScore = calculateScore(lowercaseText, KEYWORDS.management);

  const overallScore = Math.round((technicalScore + softSkillsScore + managementScore) / 3);

  const checks = runBestPracticeChecks(trimmed);
  const practicesScore = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length);

  const results = {
    technicalScore,
    softSkillsScore,
    managementScore,
    overallScore,
    practicesScore,
    grade: scoreGrade(overallScore),
    practicesGrade: scoreGrade(practicesScore),
    matches,
    charCount: validation.charCount,
    wordCount: validation.wordCount,
  };

  const suggestions = generateSuggestions(results, checks, options.targetRole);

  return {
    success: true,
    validation,
    results,
    checks,
    suggestions,
    meta: {
      analyzedAt: new Date().toISOString(),
      targetRole: options.targetRole || 'general',
    },
  };
}

module.exports = {
  analyzeResume,
  validateText,
  LIMITS,
  KEYWORDS,
  TARGET_ROLES,
};
