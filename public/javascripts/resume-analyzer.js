/**
 * Resume Analyzer — browser fallback engine (mirrors utils/resumeAnalyzer.js).
 * Used when /api/analyze is unavailable (static hosting).
 */
class ResumeAnalyzer {
  analyze(text, options) {
    const validation = ResumeAnalyzer.validateText(text);
    if (!validation.valid) {
      return {
        success: false,
        validation,
        error: validation.errors[0]?.message || 'Invalid resume text',
      };
    }

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const matches = ResumeAnalyzer.findMatches(lower);

    const technicalScore = ResumeAnalyzer.calculateScore(lower, ResumeAnalyzer.KEYWORDS.technical);
    const softSkillsScore = ResumeAnalyzer.calculateScore(lower, ResumeAnalyzer.KEYWORDS.soft);
    const managementScore = ResumeAnalyzer.calculateScore(
      lower,
      ResumeAnalyzer.KEYWORDS.management
    );
    const overallScore = Math.round((technicalScore + softSkillsScore + managementScore) / 3);

    const checks = ResumeAnalyzer.runBestPracticeChecks(trimmed);
    const practicesScore = Math.round(checks.reduce((s, c) => s + c.score, 0) / checks.length);

    const results = {
      technicalScore,
      softSkillsScore,
      managementScore,
      overallScore,
      practicesScore,
      grade: ResumeAnalyzer.scoreGrade(overallScore),
      practicesGrade: ResumeAnalyzer.scoreGrade(practicesScore),
      matches,
      charCount: validation.charCount,
      wordCount: validation.wordCount,
    };

    return {
      success: true,
      validation,
      results,
      checks,
      suggestions: ResumeAnalyzer.generateSuggestions(results, checks, options.targetRole),
      meta: { analyzedAt: new Date().toISOString(), targetRole: options.targetRole || 'general' },
    };
  }

  static validateText(text) {
    const errors = [];
    const warnings = [];
    if (!text || !text.trim()) {
      errors.push({ code: 'EMPTY', message: 'Please paste your resume text before analyzing.' });
      return { valid: false, errors, warnings };
    }
    const trimmed = text.trim();
    const charCount = trimmed.length;
    const wordCount = ResumeAnalyzer.countWords(trimmed);
    if (charCount < ResumeAnalyzer.LIMITS.minChars) {
      errors.push({
        code: 'TOO_SHORT',
        message: `Resume is too short (${charCount} chars). Add at least ${ResumeAnalyzer.LIMITS.minChars} characters.`,
      });
    }
    if (charCount > ResumeAnalyzer.LIMITS.maxChars) {
      errors.push({
        code: 'TOO_LONG',
        message: `Resume exceeds the ${ResumeAnalyzer.LIMITS.maxChars.toLocaleString()} character limit.`,
      });
    }
    if (wordCount < ResumeAnalyzer.LIMITS.minWords) {
      warnings.push({ code: 'LOW_WORD_COUNT', message: `Only ${wordCount} words detected.` });
    }
    return { valid: errors.length === 0, errors, warnings, charCount, wordCount };
  }

  static countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  static calculateScore(text, keywords) {
    let matches = 0;
    keywords.forEach(kw => {
      if (text.includes(kw)) matches++;
    });
    return Math.round((matches / keywords.length) * 100);
  }

  static findMatches(text) {
    const matches = { technical: [], soft: [], management: [] };
    Object.keys(ResumeAnalyzer.KEYWORDS).forEach(cat => {
      ResumeAnalyzer.KEYWORDS[cat].forEach(kw => {
        if (text.includes(kw)) matches[cat].push(kw);
      });
    });
    return matches;
  }

  static scoreGrade(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs-work';
  }

  static runBestPracticeChecks(text) {
    const lower = text.toLowerCase();
    const checks = [];

    const actionVerbMatches = ResumeAnalyzer.ACTION_VERBS.filter(v => lower.includes(v));
    checks.push({
      id: 'action-verbs',
      label: 'Action verbs',
      passed: actionVerbMatches.length >= 3,
      score: Math.min(100, Math.round((actionVerbMatches.length / 5) * 100)),
      hint:
        actionVerbMatches.length >= 3
          ? `Found ${actionVerbMatches.length} strong verbs.`
          : 'Start bullet points with verbs like Led, Built, Delivered.',
    });

    const quantified = (text.match(/\d+[%kKmMbB]?|\$\d+|#\d+/g) || []).length;
    checks.push({
      id: 'metrics',
      label: 'Quantified results',
      passed: quantified >= 2,
      score: Math.min(100, quantified * 25),
      hint:
        quantified >= 2
          ? `Found ${quantified} measurable achievements.`
          : 'Add numbers and percentages.',
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
        hasEmail ? 'Email ✓' : 'Add email',
        hasPhone ? 'Phone ✓' : 'Add phone',
        hasLinkedIn ? 'LinkedIn ✓' : 'Add LinkedIn',
      ].join(' · '),
    });

    ResumeAnalyzer.SECTION_HINTS.forEach(section => {
      const found = section.patterns.some(p => p.test(text));
      checks.push({
        id: section.id,
        label: `${section.label} section`,
        passed: found,
        score: found ? 100 : 0,
        hint: found ? `${section.label} section detected.` : `Add a "${section.label}" heading.`,
      });
    });

    const hasBullets = /(^|\n)\s*[-•*–]\s/m.test(text) || /(^|\n)\s*\d+\.\s/m.test(text);
    checks.push({
      id: 'formatting',
      label: 'Bullet formatting',
      passed: hasBullets,
      score: hasBullets ? 100 : 40,
      hint: hasBullets
        ? 'Bullet points improve readability.'
        : 'Use bullet points for achievements.',
    });

    const wordCount = ResumeAnalyzer.countWords(text);
    const { idealWordsMin, idealWordsMax } = ResumeAnalyzer.LIMITS;
    const lengthOk = wordCount >= idealWordsMin && wordCount <= idealWordsMax;
    checks.push({
      id: 'length',
      label: 'Resume length',
      passed: lengthOk,
      score: lengthOk ? 100 : wordCount < idealWordsMin ? 50 : 70,
      hint: lengthOk ? `${wordCount} words — ideal range.` : `${wordCount} words — adjust length.`,
    });

    const weakFound = ResumeAnalyzer.WEAK_PHRASES.filter(p => lower.includes(p));
    checks.push({
      id: 'passive-voice',
      label: 'Strong phrasing',
      passed: weakFound.length === 0,
      score: weakFound.length === 0 ? 100 : Math.max(0, 100 - weakFound.length * 25),
      hint:
        weakFound.length === 0
          ? 'No weak filler phrases.'
          : `Replace: "${weakFound.join('", "')}".`,
    });

    const datePatterns = text.match(/\b(19|20)\d{2}\s*[-–—]\s*(present|(19|20)\d{2})\b/gi) || [];
    checks.push({
      id: 'dates',
      label: 'Employment dates',
      passed: datePatterns.length >= 1,
      score: Math.min(100, datePatterns.length * 50),
      hint:
        datePatterns.length >= 1
          ? 'Employment dates detected.'
          : 'Include date ranges for each role.',
    });

    return checks;
  }

  static generateSuggestions(results, checks, targetRole) {
    const suggestions = [];
    if (results.technicalScore < 30) {
      suggestions.push({ type: 'improvement', text: 'Highlight more technical skills.' });
    }
    if (results.softSkillsScore < 30) {
      suggestions.push({ type: 'improvement', text: 'Emphasize soft skills with examples.' });
    }
    if (results.managementScore < 20) {
      suggestions.push({ type: 'tip', text: 'Quantify leadership experience if applicable.' });
    }
    const scores = [results.technicalScore, results.softSkillsScore, results.managementScore];
    if (Math.max(...scores) - Math.min(...scores) > 50) {
      suggestions.push({
        type: 'balance',
        text: 'Skill profile looks unbalanced — diversify keywords.',
      });
    }
    checks
      .filter(c => !c.passed)
      .forEach(c => suggestions.push({ type: 'practice', text: c.hint }));
    if (targetRole && ResumeAnalyzer.TARGET_ROLES[targetRole]) {
      const role = ResumeAnalyzer.TARGET_ROLES[targetRole];
      role.boost.forEach(cat => {
        const key =
          cat === 'technical'
            ? 'technicalScore'
            : cat === 'soft'
              ? 'softSkillsScore'
              : 'managementScore';
        if (results[key] < 50) {
          suggestions.push({
            type: 'role',
            text: `For ${role.label}, strengthen ${cat} keywords.`,
          });
        }
      });
    }
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        text: 'Your resume looks well-balanced! Fine-tune per job posting.',
      });
    }
    return suggestions;
  }
}

ResumeAnalyzer.LIMITS = {
  minChars: 80,
  maxChars: 20000,
  minWords: 40,
  idealWordsMin: 250,
  idealWordsMax: 900,
};

ResumeAnalyzer.KEYWORDS = {
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

ResumeAnalyzer.ACTION_VERBS = [
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

ResumeAnalyzer.WEAK_PHRASES = [
  'responsible for',
  'duties included',
  'helped with',
  'worked on',
  'involved in',
  'assisted with',
];

ResumeAnalyzer.SECTION_HINTS = [
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

ResumeAnalyzer.TARGET_ROLES = {
  engineering: { boost: ['technical'], label: 'Software Engineering' },
  management: { boost: ['management', 'soft'], label: 'Management / Leadership' },
  general: { boost: ['technical', 'soft', 'management'], label: 'General / Mixed' },
};

window.ResumeAnalyzer = ResumeAnalyzer;
