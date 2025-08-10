/**
 * Resume Analyzer
 * A simple utility to help users analyze their resume
 */

class ResumeAnalyzer {
  constructor() {
    this.keywords = {
      technical: [
        'javascript',
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
      ],
    };
  }

  /**
   * Analyze resume text for keyword matches
   * @param {string} text - The resume text content
   * @returns {Object} Analysis results
   */
  analyze(text) {
    if (!text) return { error: 'No text provided for analysis' };

    const lowercaseText = text.toLowerCase();
    const results = {
      technicalScore: this._calculateScore(lowercaseText, this.keywords.technical),
      softSkillsScore: this._calculateScore(lowercaseText, this.keywords.soft),
      managementScore: this._calculateScore(lowercaseText, this.keywords.management),
      matches: this._findMatches(lowercaseText),
      suggestions: [],
    };

    // Generate suggestions based on scores
    this._generateSuggestions(results);

    return results;
  }

  /**
   * Calculate score based on keyword matches
   * @private
   */
  _calculateScore(text, keywords) {
    let matches = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) matches++;
    });
    return Math.round((matches / keywords.length) * 100);
  }

  /**
   * Find all keyword matches in the text
   * @private
   */
  _findMatches(text) {
    const matches = {
      technical: [],
      soft: [],
      management: [],
    };

    Object.keys(this.keywords).forEach(category => {
      this.keywords[category].forEach(keyword => {
        if (text.includes(keyword)) {
          matches[category].push(keyword);
        }
      });
    });

    return matches;
  }

  /**
   * Generate suggestions based on analysis results
   * @private
   */
  _generateSuggestions(results) {
    // Technical suggestions
    if (results.technicalScore < 30) {
      results.suggestions.push('Consider adding more technical skills to your resume');
    }

    // Soft skills suggestions
    if (results.softSkillsScore < 30) {
      results.suggestions.push('Your resume could benefit from highlighting more soft skills');
    }

    // Management suggestions
    if (results.managementScore < 20) {
      results.suggestions.push('If you have management experience, try to emphasize it more');
    }

    // Balance suggestion
    const scores = [results.technicalScore, results.softSkillsScore, results.managementScore];
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    if (max - min > 50) {
      results.suggestions.push(
        'Your resume seems unbalanced. Consider adding more diverse skills and experiences'
      );
    }
  }
}

// Make available in the global scope
window.ResumeAnalyzer = ResumeAnalyzer;
