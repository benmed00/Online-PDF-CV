/**
 * Resume Job Matcher — client-side validation UI.
 */
(function () {
  const els = {};

  function cacheElements() {
    [
      'resume-text',
      'job-description',
      'validate-btn',
      'results',
      'overall-score',
      'overall-bar',
      'found-requirements',
      'missing-requirements',
      'suggestions',
      'alert-banner',
      'alert-message',
    ].forEach(id => {
      els[id] = document.getElementById(id);
    });
  }

  function showAlert(message, type = 'error') {
    els['alert-message'].textContent = message;
    els['alert-banner'].className = `alert-banner visible ${type}`;
  }

  function hideAlert() {
    els['alert-banner'].classList.remove('visible');
  }

  function setLoading(loading) {
    els['validate-btn'].disabled = loading;
    els['validate-btn'].classList.toggle('loading', loading);
    els['validate-btn'].setAttribute('aria-busy', loading ? 'true' : 'false');
  }

  function clearFieldErrors() {
    ['resume-text', 'job-description'].forEach(id => {
      els[id]?.setAttribute('aria-invalid', 'false');
    });
  }

  function extractRequirements(jobDescription) {
    const requirementIndicators = [
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

    const sentences = jobDescription.split(/[.!?]+/);
    const potentialRequirements = [];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (requirementIndicators.some(indicator => lowerSentence.includes(indicator))) {
        const words = sentence.trim().split(/\s+/);
        if (words.length >= 3 && words.length <= 10) {
          potentialRequirements.push(sentence.trim());
        } else if (words.length > 10) {
          potentialRequirements.push(...extractKeyPhrases(sentence));
        }
      }
    });

    return [...new Set(potentialRequirements)]
      .filter(req => req.split(/\s+/).length >= 2)
      .slice(0, 10);
  }

  function extractKeyPhrases(sentence) {
    const phrases = [];
    const words = sentence.trim().split(/\s+/);
    const skillIndicators = [
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

    for (let i = 0; i < words.length - 2; i++) {
      if (skillIndicators.some(indicator => words[i].toLowerCase().includes(indicator))) {
        const phraseLength = Math.min(5, words.length - i);
        const phrase = words.slice(i, i + phraseLength).join(' ');
        phrases.push(phrase);
        i += phraseLength - 1;
      }
    }

    return phrases;
  }

  function validateResume(resumeText, jobDescription) {
    const requirements = extractRequirements(jobDescription);
    const foundReqs = [];
    const missingReqs = [];

    requirements.forEach(req => {
      if (resumeText.toLowerCase().includes(req.toLowerCase())) {
        foundReqs.push(req);
      } else {
        missingReqs.push(req);
      }
    });

    const overallScore =
      requirements.length > 0 ? Math.round((foundReqs.length / requirements.length) * 100) : 0;

    const suggestions = [];
    if (missingReqs.length > 0) {
      suggestions.push(
        `Consider adding these ${missingReqs.length} missing requirements to your resume.`
      );
      if (missingReqs.length > 3) {
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
      foundRequirements: foundReqs,
      missingRequirements: missingReqs,
      suggestions,
    };
  }

  function renderList(container, items, emptyMessage) {
    container.innerHTML = '';
    if (!items.length) {
      const li = document.createElement('li');
      li.textContent = emptyMessage;
      container.appendChild(li);
      return;
    }
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      container.appendChild(li);
    });
  }

  function runValidation() {
    hideAlert();
    clearFieldErrors();

    const resumeContent = els['resume-text'].value.trim();
    const jobContent = els['job-description'].value.trim();

    if (!resumeContent) {
      els['resume-text'].setAttribute('aria-invalid', 'true');
      showAlert('Please paste your resume text before validating.');
      els['resume-text'].focus();
      return;
    }

    if (!jobContent) {
      els['job-description'].setAttribute('aria-invalid', 'true');
      showAlert('Please paste the job description before validating.');
      els['job-description'].focus();
      return;
    }

    setLoading(true);
    try {
      const results = validateResume(resumeContent, jobContent);

      els['overall-score'].textContent = `${results.overallScore}%`;
      els['overall-bar'].style.width = `${results.overallScore}%`;
      els['overall-bar'].className = 'progress-bar';
      if (results.overallScore < 30) {
        els['overall-bar'].classList.add('low');
      } else if (results.overallScore < 70) {
        els['overall-bar'].classList.add('medium');
      } else {
        els['overall-bar'].classList.add('high');
      }

      renderList(
        els['found-requirements'],
        results.foundRequirements,
        'No key requirements found in your resume.'
      );
      renderList(
        els['missing-requirements'],
        results.missingRequirements,
        'Your resume covers all key requirements!'
      );
      renderList(
        els['suggestions'],
        results.suggestions,
        'Your resume is well-tailored for this job!'
      );

      els['results'].classList.remove('hidden');
      els['results'].scrollIntoView({ behavior: 'smooth' });
      showAlert('Validation complete!', 'success');
      setTimeout(hideAlert, 3000);
    } catch (err) {
      showAlert(err.message || 'Validation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    els['validate-btn'].addEventListener('click', runValidation);
    document.querySelector('.alert-close')?.addEventListener('click', hideAlert);
  });
})();
