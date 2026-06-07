/**
 * Resume Analyzer — UI controller with API integration and live validation.
 */
/* global ResumeAnalyzer */
(function () {
  const SAMPLE_RESUME =
    'Jane Developer — jane.dev@email.com | (555) 123-4567 | linkedin.com/in/janedev\n\n' +
    'SUMMARY\nExperienced software engineer with 8+ years building scalable web applications.\n\n' +
    'EXPERIENCE\nSenior Software Engineer — TechCorp | 2020 – Present\n' +
    '• Led a team of 6 engineers to deliver a microservices platform, reducing latency by 40%\n' +
    '• Built React and Node.js applications serving 2M+ users on AWS with Docker and CI/CD pipelines\n' +
    '• Implemented API integrations and optimized SQL database queries, improving performance by 35%\n\n' +
    'Software Engineer — StartupXYZ | 2016 – 2020\n' +
    '• Developed JavaScript applications using Agile/Scrum methodology\n' +
    '• Collaborated cross-functionally with strong communication and problem-solving skills\n\n' +
    'SKILLS\nJavaScript, Python, React, Node, AWS, Docker, Kubernetes, Git, DevOps, SQL, NoSQL\n\n' +
    'EDUCATION\nB.S. Computer Science — State University | 2016';

  const LIMITS = { minChars: 80, minWords: 40 };

  const els = {};

  function cacheElements() {
    [
      'resume-text',
      'analyze-btn',
      'sample-btn',
      'clear-btn',
      'target-role',
      'results',
      'alert-banner',
      'alert-message',
      'drop-zone',
      'stat-chars',
      'stat-words',
      'stat-status',
      'live-hints',
      'overall-score',
      'overall-grade',
      'technical-score',
      'soft-score',
      'management-score',
      'practices-score',
      'technical-bar',
      'soft-bar',
      'management-bar',
      'practices-bar',
      'technical-keywords',
      'soft-keywords',
      'management-keywords',
      'suggestions-list',
      'practices-grid',
    ].forEach(id => {
      els[id] = document.getElementById(id);
    });
  }

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function showAlert(message, type = 'error') {
    els['alert-message'].textContent = message;
    els['alert-banner'].className = `alert-banner visible ${type}`;
  }

  function hideAlert() {
    els['alert-banner'].classList.remove('visible');
  }

  function setLoading(loading) {
    els['analyze-btn'].disabled = loading;
    els['analyze-btn'].classList.toggle('loading', loading);
  }

  function updateLiveStats() {
    const text = els['resume-text'].value;
    const chars = text.trim().length;
    const words = countWords(text);

    els['stat-chars'].textContent = `${chars.toLocaleString()} characters`;
    els['stat-words'].textContent = `${words.toLocaleString()} words`;

    els['stat-chars'].className =
      'stat-pill' + (chars >= LIMITS.minChars ? ' valid' : chars > 0 ? ' warning' : '');
    els['stat-words'].className =
      'stat-pill' + (words >= LIMITS.minWords ? ' valid' : words > 0 ? ' warning' : '');

    const statusEl = els['stat-status'];
    if (!text.trim()) {
      statusEl.textContent = 'Ready';
      statusEl.className = 'stat-pill';
    } else if (chars < LIMITS.minChars) {
      statusEl.textContent = `Need ${LIMITS.minChars - chars} more chars`;
      statusEl.className = 'stat-pill invalid';
    } else {
      statusEl.textContent = 'Ready to analyze';
      statusEl.className = 'stat-pill valid';
    }

    updateLiveHints(text, chars, words);
    els['drop-zone'].classList.toggle('has-error', chars > 0 && chars < LIMITS.minChars);
  }

  function updateLiveHints(text, chars, words) {
    const hints = [];
    if (!text.trim()) {
      els['live-hints'].innerHTML = '';
      return;
    }

    if (chars < LIMITS.minChars) {
      hints.push({
        msg: `Add ${LIMITS.minChars - chars} more characters for analysis.`,
        cls: 'warn',
      });
    }
    if (words < LIMITS.minWords) {
      hints.push({ msg: 'Most resumes need 40+ words for meaningful results.', cls: 'warn' });
    }
    if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) {
      hints.push({ msg: 'Email detected ✓', cls: 'ok' });
    }
    if (/(^|\n)\s*[-•*–]\s/m.test(text)) {
      hints.push({ msg: 'Bullet formatting detected ✓', cls: 'ok' });
    }
    if (/\d+[%]?/.test(text)) {
      hints.push({ msg: 'Quantified metrics found ✓', cls: 'ok' });
    }

    els['live-hints'].innerHTML = hints
      .map(h => `<div class="live-hint ${h.cls}">${h.msg}</div>`)
      .join('');
  }

  function scoreBarClass(score) {
    if (score < 30) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  }

  function animateBar(bar, score) {
    bar.style.width = '0%';
    bar.className = 'progress-bar';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${score}%`;
        bar.classList.add(scoreBarClass(score));
        bar.setAttribute('aria-valuenow', String(score));
      });
    });
  }

  function displayKeywords(container, keywords) {
    container.innerHTML = '';
    container.classList.remove('empty-note');
    if (!keywords.length) {
      container.textContent = 'None found';
      container.classList.add('empty-note');
      return;
    }
    keywords.forEach((kw, i) => {
      const span = document.createElement('span');
      span.className = 'keyword';
      span.textContent = kw;
      span.style.animationDelay = `${i * 0.04}s`;
      container.appendChild(span);
    });
  }

  function renderResults(data) {
    const { results, checks, suggestions } = data;

    els['overall-score'].textContent = `${results.overallScore}%`;
    els['overall-grade'].textContent = results.grade.replace('-', ' ');

    const scoreMap = [
      ['technical-score', 'technical-bar', results.technicalScore],
      ['soft-score', 'soft-bar', results.softSkillsScore],
      ['management-score', 'management-bar', results.managementScore],
      ['practices-score', 'practices-bar', results.practicesScore],
    ];
    scoreMap.forEach(([scoreId, barId, value]) => {
      els[scoreId].textContent = `${value}%`;
      animateBar(els[barId], value);
    });

    displayKeywords(els['technical-keywords'], results.matches.technical);
    displayKeywords(els['soft-keywords'], results.matches.soft);
    displayKeywords(els['management-keywords'], results.matches.management);

    els['practices-grid'].innerHTML = checks
      .map(
        c => `
      <div class="practice-check ${c.passed ? 'passed' : 'failed'}">
        <span class="check-icon">${c.passed ? '✓' : '!'}</span>
        <div>
          <div class="check-label">${c.label}</div>
          <div class="check-hint">${c.hint}</div>
        </div>
      </div>`
      )
      .join('');

    els['suggestions-list'].innerHTML = suggestions
      .map(
        (s, i) => `
      <li style="animation-delay:${i * 0.05}s">
        <span class="suggestion-type ${s.type}">${s.type}</span>
        <span>${s.text}</span>
      </li>`
      )
      .join('');

    els['results'].classList.remove('hidden');
    els['results'].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function analyzeViaApi(text, targetRole) {
    let response;
    try {
      response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetRole }),
      });
    } catch {
      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return null;
    }

    if (response.ok) return data;

    if (response.status === 400 && (data.error || data.validation)) {
      throw new Error(data.error || data.message || 'Invalid resume text');
    }

    return null;
  }

  function analyzeLocally(text, targetRole) {
    const analyzer = new ResumeAnalyzer();
    const data = analyzer.analyze(text, { targetRole });
    if (!data.success) throw new Error(data.error);
    return data;
  }

  async function runAnalysis() {
    hideAlert();
    const text = els['resume-text'].value.trim();
    const targetRole = els['target-role'].value;

    if (!text) {
      showAlert('Please paste your resume text before analyzing.');
      els['resume-text'].focus();
      return;
    }

    setLoading(true);
    try {
      let data = await analyzeViaApi(text, targetRole);
      if (!data) {
        data = analyzeLocally(text, targetRole);
      }
      renderResults(data);
      showAlert('Analysis complete!', 'success');
      setTimeout(hideAlert, 3000);
    } catch (err) {
      showAlert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  function setupDropZone() {
    const zone = els['drop-zone'];
    ['dragenter', 'dragover'].forEach(evt => {
      zone.addEventListener(evt, e => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      zone.addEventListener(evt, e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
      });
    });
    zone.addEventListener('drop', e => {
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
        showAlert('Only .txt files are supported for upload. Paste PDF content manually.');
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        els['resume-text'].value = ev.target.result;
        updateLiveStats();
      };
      reader.onerror = () => showAlert('Could not read the file. Please try again.');
      reader.readAsText(file);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupTabs();
    setupDropZone();

    els['analyze-btn'].addEventListener('click', runAnalysis);
    els['sample-btn'].addEventListener('click', () => {
      els['resume-text'].value = SAMPLE_RESUME;
      updateLiveStats();
      hideAlert();
    });
    els['clear-btn'].addEventListener('click', () => {
      els['resume-text'].value = '';
      els['results'].classList.add('hidden');
      updateLiveStats();
      hideAlert();
      els['resume-text'].focus();
    });
    els['resume-text'].addEventListener('input', updateLiveStats);
    els['resume-text'].addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        runAnalysis();
      }
    });
    document.querySelector('.alert-close')?.addEventListener('click', hideAlert);

    updateLiveStats();
  });
})();
