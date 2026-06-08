/**
 * Resume Analyzer — UI controller with API integration and live validation.
 */
/* global ResumeAnalyzer, ApiClient */
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

  const LIMITS = { minChars: 80, maxChars: 20000, minWords: 40 };

  const LOCAL_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.html', '.htm', '.csv', '.rtf']);

  const SUPPORTED_EXTENSIONS = [
    '.txt',
    '.md',
    '.markdown',
    '.html',
    '.htm',
    '.csv',
    '.rtf',
    '.doc',
    '.docx',
    '.xlsx',
    '.odt',
    '.ods',
    '.odp',
    '.pptx',
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.bmp',
    '.tif',
    '.tiff',
  ];

  const els = {};
  let serverConfig = { openAi: false, virusTotal: false };

  function cacheElements() {
    [
      'resume-text',
      'analyze-btn',
      'sample-btn',
      'clear-btn',
      'upload-btn',
      'file-upload',
      'upload-status',
      'target-role',
      'use-ai',
      'ai-toggle-label',
      'ai-tab-btn',
      'ai-insights-panel',
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
    els['analyze-btn'].classList.toggle('loading', loading);
    els['analyze-btn'].setAttribute('aria-busy', loading ? 'true' : 'false');
    if (!loading) {
      updateLiveStats();
    } else {
      els['analyze-btn'].disabled = true;
    }
  }

  function setUploading(loading) {
    els['upload-btn'].disabled = loading;
    els['upload-btn'].classList.toggle('loading', loading);
    els['upload-btn'].setAttribute('aria-busy', loading ? 'true' : 'false');
    els['drop-zone'].classList.toggle('uploading', loading);
  }

  function getExtension(filename) {
    const dot = filename.lastIndexOf('.');
    return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
  }

  function isSupportedFile(filename) {
    return SUPPORTED_EXTENSIONS.includes(getExtension(filename));
  }

  function formatSecurityLine(security) {
    if (!security) return '';
    if (security.skipped || !security.scanned) {
      return 'Security scan: not run (configure VIRUSTOTAL_API_KEY on server).';
    }
    const s = security.stats;
    const clean = (s.harmless || 0) + (s.undetected || 0);
    return `Security scan (VirusTotal): ${security.verdict} — ${clean} engines clean, ${s.malicious || 0} malicious, ${s.suspicious || 0} suspicious.`;
  }

  function setUploadStatus(message, type, subline) {
    const el = els['upload-status'];
    if (!message) {
      el.classList.add('hidden');
      el.innerHTML = '';
      el.className = 'upload-status hidden';
      return;
    }
    el.className = `upload-status ${type || ''}`.trim();
    const safeMessage = escapeHtml(message);
    const safeSubline = subline ? escapeHtml(subline) : '';
    el.innerHTML = safeSubline
      ? `<strong>${safeMessage}</strong><span class="upload-subline">${safeSubline}</span>`
      : safeMessage;
    el.classList.remove('hidden');
  }

  function htmlToPlainText(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, noscript').forEach(node => node.remove());
    return (doc.body?.textContent || doc.documentElement?.textContent || '').trim();
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = () => reject(new Error('Could not read the file.'));
      reader.readAsText(file);
    });
  }

  async function extractFileLocally(file) {
    const ext = getExtension(file.name);
    const raw = await readFileAsText(file);
    if (ext === '.html' || ext === '.htm') return htmlToPlainText(raw);
    return raw;
  }

  async function extractFileViaApi(file) {
    const formData = new FormData();
    formData.append('file', file);

    const data = await ApiClient.fetchApi('/api/extract-resume', {
      method: 'POST',
      body: formData,
    });
    return data;
  }

  function applyExtractedText(text, sourceLabel, security) {
    els['resume-text'].value = text;
    els['drop-zone'].classList.add('has-content');
    updateLiveStats();
    const main = sourceLabel
      ? `Imported from ${sourceLabel} (${text.length.toLocaleString()} characters)`
      : 'Import complete';
    const sub = formatSecurityLine(security);
    setUploadStatus(
      main,
      security?.scanned && security.verdict === 'clean' ? 'success' : 'success',
      sub
    );
  }

  async function handleFileUpload(file) {
    if (!file) return;

    hideAlert();
    setUploadStatus('', '');

    if (!isSupportedFile(file.name)) {
      showAlert(`Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (serverConfig.maxUploadMb && file.size > serverConfig.maxUploadMb * 1024 * 1024) {
      showAlert(`File exceeds the ${serverConfig.maxUploadMb} MB limit. Choose a smaller file.`);
      return;
    }

    const ext = getExtension(file.name);
    setUploading(true);
    const needsServerScan = !LOCAL_EXTENSIONS.has(ext);
    setUploadStatus(
      needsServerScan ? `Security scan & extraction: ${file.name}…` : `Reading ${file.name}…`,
      ''
    );

    try {
      let text = '';
      let security = null;

      if (LOCAL_EXTENSIONS.has(ext)) {
        text = await extractFileLocally(file);
        security = {
          scanned: false,
          skipped: true,
          reason: 'Plain-text formats are read locally without VirusTotal scan',
        };
      } else {
        const apiResult = await extractFileViaApi(file);
        text = apiResult.text;
        security = apiResult.security;
      }

      text = text.trim();
      if (text.length < 10) {
        throw new Error(
          'Not enough text was extracted. Try another export format or paste manually.'
        );
      }

      applyExtractedText(text, file.name, security);
      const alertMsg =
        security?.scanned && security.verdict === 'clean'
          ? `Loaded ${file.name} — passed VirusTotal security scan.`
          : `Loaded ${file.name} successfully.`;
      showAlert(alertMsg, 'success');
      setTimeout(hideAlert, 3500);
    } catch (err) {
      const msg =
        err instanceof ApiClient.NetworkError
          ? err.message
          : err.message || 'Upload failed. Please try again.';
      setUploadStatus(msg, 'error');
      showAlert(msg);
    } finally {
      setUploading(false);
      if (els['file-upload']) els['file-upload'].value = '';
    }
  }

  function syncDropZoneState() {
    const hasText = Boolean(els['resume-text'].value.trim());
    els['drop-zone'].classList.toggle('has-content', hasText);
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

    const tooShort = chars > 0 && chars < LIMITS.minChars;
    const tooLong = chars > LIMITS.maxChars;
    const canAnalyze = chars >= LIMITS.minChars && chars <= LIMITS.maxChars;

    els['analyze-btn'].disabled = !canAnalyze;
    els['resume-text'].setAttribute('aria-invalid', tooShort || tooLong ? 'true' : 'false');

    updateLiveHints(text, chars, words);
    els['drop-zone'].classList.toggle('has-error', tooShort || tooLong);
    syncDropZoneState();
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
    if (chars > LIMITS.maxChars) {
      hints.push({
        msg: `Resume exceeds ${LIMITS.maxChars.toLocaleString()} character limit — shorten before analyzing.`,
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAiInsights(aiInsights) {
    const panel = els['ai-insights-panel'];
    const tabBtn = els['ai-tab-btn'];
    if (!panel) return;

    if (!aiInsights?.available) {
      tabBtn?.classList.add('hidden');
      panel.innerHTML = `<p class="ai-placeholder">${escapeHtml(
        aiInsights?.error ||
          (aiInsights?.skipped
            ? 'Enable OPENAI_API_KEY on the server for AI coach insights.'
            : 'AI insights unavailable.')
      )}</p>`;
      return;
    }

    tabBtn?.classList.remove('hidden');

    const list = (title, items, cls) => {
      if (!items?.length) return '';
      return `<div class="ai-block"><h4>${escapeHtml(title)}</h4><ul class="ai-list ${cls}">${items
        .map(item => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul></div>`;
    };

    panel.innerHTML = `
      <div class="ai-summary-card">
        <div class="ai-score-badge">${aiInsights.scoreEstimate ?? '—'}<span>/100</span></div>
        <p class="ai-summary-text">${escapeHtml(aiInsights.summary || '')}</p>
      </div>
      ${list('Strengths', aiInsights.strengths, 'strengths')}
      ${list('Improvements', aiInsights.improvements, 'improvements')}
      ${list('ATS tips', aiInsights.atsTips, 'tips')}
      ${list('Keywords to add', aiInsights.missingKeywords, 'keywords')}
      <p class="ai-meta">Model: ${escapeHtml(aiInsights.model || 'OpenAI')} · ${escapeHtml(new Date(aiInsights.generatedAt).toLocaleString())}</p>
    `;
  }

  function renderResults(data) {
    const { results, checks, suggestions, aiInsights } = data;

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
          <div class="check-label">${escapeHtml(c.label)}</div>
          <div class="check-hint">${escapeHtml(c.hint)}</div>
        </div>
      </div>`
      )
      .join('');

    els['suggestions-list'].innerHTML = suggestions
      .map(
        (s, i) => `
      <li style="animation-delay:${i * 0.05}s">
        <span class="suggestion-type ${escapeHtml(s.type)}">${escapeHtml(s.type)}</span>
        <span>${escapeHtml(s.text)}</span>
      </li>`
      )
      .join('');

    renderAiInsights(aiInsights);

    els['results'].classList.remove('hidden');
    els['results'].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function analyzeViaApi(text, targetRole, useAi) {
    return ApiClient.fetchApi('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetRole, useAi }),
    });
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
      const useAi = serverConfig.openAi && els['use-ai']?.checked !== false;
      let data;
      let usedLocalFallback = false;

      try {
        data = await analyzeViaApi(text, targetRole, useAi);
      } catch (err) {
        if (err instanceof ApiClient.ApiError && err.statusCode === 400) {
          throw err;
        }
        data = analyzeLocally(text, targetRole);
        data.aiInsights = { available: false, skipped: true, reason: 'local_only' };
        usedLocalFallback = true;
      }

      renderResults(data);

      if (usedLocalFallback) {
        const fallbackMsg =
          'Server unavailable — showing offline analysis. Start the dev server for full features.';
        showAlert(fallbackMsg, 'warning');
        setTimeout(hideAlert, 5000);
      } else {
        const doneMsg = data.aiInsights?.available
          ? 'Analysis complete with AI coach insights!'
          : 'Analysis complete!';
        showAlert(doneMsg, 'success');
        setTimeout(hideAlert, 3000);
      }
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
      if (file) handleFileUpload(file);
    });
  }

  function setupUpload() {
    els['upload-btn'].addEventListener('click', () => els['file-upload'].click());
    els['file-upload'].addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    });
  }

  async function loadServerConfig() {
    try {
      const response = await fetch('/api/analyzer/config');
      if (!response.ok) return;
      serverConfig = await response.json();
      if (serverConfig.openAi) {
        els['ai-toggle-label']?.classList.remove('hidden');
      }
    } catch {
      /* static hosting — local analysis only */
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupTabs();
    setupDropZone();
    setupUpload();
    loadServerConfig();

    els['analyze-btn'].addEventListener('click', runAnalysis);
    els['sample-btn'].addEventListener('click', () => {
      els['resume-text'].value = SAMPLE_RESUME;
      updateLiveStats();
      hideAlert();
    });
    els['clear-btn'].addEventListener('click', () => {
      els['resume-text'].value = '';
      els['results'].classList.add('hidden');
      setUploadStatus('', '');
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
