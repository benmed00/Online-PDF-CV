const MAX_JOB_DESCRIPTION_CHARS = 8000;

const REQUIREMENT_INDICATORS = [
  'required',
  'requirements',
  'qualifications',
  'skills',
  'experience',
  'proficiency',
  'knowledge',
  'familiarity',
  'ability to',
  'expertise',
  'competency',
  'proficient',
];

const SKILL_INDICATORS = [
  'experience',
  'knowledge',
  'skill',
  'proficiency',
  'ability',
  'years',
  'degree',
  'certification',
  'familiar',
  'expert',
];

function extractKeyPhrases(sentence) {
  const phrases = [];
  const words = sentence.trim().split(/\s+/);

  for (let i = 0; i < words.length - 2; i++) {
    if (SKILL_INDICATORS.some(indicator => words[i].toLowerCase().includes(indicator))) {
      const phraseLength = Math.min(5, words.length - i);
      const phrase = words.slice(i, i + phraseLength).join(' ');
      phrases.push(phrase);
      i += phraseLength - 1;
    }
  }

  return phrases;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'with',
  'for',
  'your',
  'must',
  'have',
  'include',
  'skills',
  'skill',
  'required',
  'requirements',
  'qualifications',
  'experience',
  'years',
  'strong',
  'our',
  'you',
  'are',
  'will',
  'this',
  'that',
  'from',
]);

function extractSkillFragments(sentence) {
  const fragments = [];
  sentence
    .split(/[:,;]+/)
    .map(part => part.trim())
    .filter(part => part.length > 2)
    .forEach(part => {
      const words = part.split(/\s+/);
      if (words.length >= 2 && words.length <= 8) {
        fragments.push(part);
      }
      part.split(/\s+(?:and|or)\s+/i).forEach(token => {
        const trimmed = token.trim();
        if (trimmed.length > 2 && !STOP_WORDS.has(trimmed.toLowerCase())) {
          fragments.push(trimmed);
        }
      });
    });
  return fragments;
}

function extractRequirements(jobDescription) {
  const trimmed = String(jobDescription || '')
    .trim()
    .slice(0, MAX_JOB_DESCRIPTION_CHARS);
  if (!trimmed) return [];

  const sentences = trimmed.split(/[.!?]+/);
  const potentialRequirements = [];

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (REQUIREMENT_INDICATORS.some(indicator => lowerSentence.includes(indicator))) {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 3 && words.length <= 10) {
        potentialRequirements.push(sentence.trim());
      } else if (words.length > 10) {
        potentialRequirements.push(...extractKeyPhrases(sentence));
      }
      potentialRequirements.push(...extractSkillFragments(sentence));
    }
  });

  return [...new Set(potentialRequirements)]
    .filter(req => req.split(/\s+/).length >= 1 && req.length > 2)
    .slice(0, 15);
}

function requirementMatchesResume(requirement, resume) {
  const normalizedReq = requirement
    .toLowerCase()
    .replace(/[^\w\s+.#-]/g, ' ')
    .trim();
  if (!normalizedReq) return false;
  if (resume.includes(normalizedReq)) return true;

  const tokens = normalizedReq
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
  if (!tokens.length) return resume.includes(normalizedReq);

  const matched = tokens.filter(token => resume.includes(token));
  return matched.length / tokens.length >= 0.5;
}

function matchResumeToJob(resumeText, jobDescription) {
  const requirements = extractRequirements(jobDescription);
  const resume = String(resumeText || '').toLowerCase();
  const foundRequirements = [];
  const missingRequirements = [];

  requirements.forEach(req => {
    if (requirementMatchesResume(req, resume)) {
      foundRequirements.push(req);
    } else {
      missingRequirements.push(req);
    }
  });

  const overallScore =
    requirements.length > 0
      ? Math.round((foundRequirements.length / requirements.length) * 100)
      : 0;

  const suggestions = [];
  if (missingRequirements.length > 0) {
    suggestions.push(
      `Consider adding these ${missingRequirements.length} missing requirements to your resume.`
    );
    if (missingRequirements.length > 3) {
      suggestions.push('Focus on adding the most important requirements first.');
    }
    suggestions.push(
      'Use specific examples to demonstrate your experience with these requirements.'
    );
  }
  if (overallScore < 50) {
    suggestions.push('Your resume may need significant revisions for this job.');
  } else if (overallScore < 70) {
    suggestions.push('Your resume is somewhat aligned with this job but could use improvement.');
  }

  return {
    overallScore,
    requirementCount: requirements.length,
    foundRequirements,
    missingRequirements,
    suggestions,
  };
}

module.exports = {
  extractRequirements,
  extractKeyPhrases,
  requirementMatchesResume,
  matchResumeToJob,
  MAX_JOB_DESCRIPTION_CHARS,
};
