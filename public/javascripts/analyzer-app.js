/**
 * Resume Analyzer — stepper workflow, hosted CV, job match, persistence, export.
 */
/* global ResumeAnalyzer, ApiClient, JobDescriptionMatcher */
(function () {
  const SAMPLE_RESUME =
    'Jane Developer — jane.dev@email.com | (555) 123-4567 | linkedin.com/in/janedev\n\n' +
    'SUMMARY\nExperienced software engineer with 8+ years building scalable web applications.\n\n' +
    'EXPERIENCE\nSenior Software Engineer — TechCorp | 2020 – Present\n' +
    '• Led a team of 6 engineers to deliver a microservices platform, reducing latency by 40%\n' +
    '• Built React and Node.js applications serving 2M+ users on AWS with Docker and CI/CD pipelines\n' +
    '• Implemented API integrations and optimized SQL database queries, improving performance by 35%\n\n' +
    'SKILLS\nJavaScript, Python, React, Node, AWS, Docker, Kubernetes, Git, DevOps, SQL, NoSQL\n\n' +
    'EDUCATION\nB.S. Computer Science — State University | 2016';

  const LIMITS = { minChars: 80, maxChars: 20000, minWords: 40 };
  const STORAGE_KEYS = {
    draft: 'analyzer:draft',
    jobDescription: 'analyzer:lastJobDescription',
    results: 'analyzer:lastResults',
    hostedVersion: 'analyzer:lastHostedVersion',
  };

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
  let serverConfig = { mode: 'static', openAi: false, virusTotal: false };
  let lastResults = null;
  let lastHostedVersion = 'default';

  function cacheElements() {
    const ids = [
      'resume-text',
      'job-description',
      'analyze-btn',
      'sample-btn',
      'clear-btn',
      'upload-btn',
      'file-upload',
      'upload-status',
      'upload-progress',
      'upload-step-scan',
      'upload-step-extract',
      'upload-step-ready',
      'target-role',
      'use-ai',
      'ai-toggle-label',
      'ai-tab-btn',
      'job-tab-btn',
      'ai-insights-panel',
      'job-match-panel',
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
      'capability-strip',
      'toast-container',
      'cv-version',
      'load-cv-btn',
      'goto-step-2',
      'back-step-1',
      'action-plan',
      'action-plan-list',
      'next-steps',
      'next-compare',
      'next-resume',
      'download-report-btn',
      'analyze-again-btn',
      'tips-toggle',
      'tips-drawer',
    ];
    ids.forEach(id => {
      els[id] = document.getElementById(id);
    });
  }

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showAlert(message, type = 'error') {
    if (type === 'success') {
      showToast(message, 'success');
      return;
    }
    els['alert-message'].textContent = message;
    els['alert-banner'].className = `alert-banner visible ${type}`;
  }

  function hideAlert() {
    els['alert-banner'].classList.remove('visible');
  }

  function showToast(message, type = 'info') {
    const container = els['toast-container'];
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function setLoading(loading) {
    els['analyze-btn'].classList.toggle('loading', loading);
    els['analyze-btn'].setAttribute('aria-busy', loading ? 'true' : 'false');
    if (!loading) updateLiveStats();
    else els['analyze-btn'].disabled = true;
  }

  function setUploading(loading) {
    els['upload-btn'].disabled = loading;
    els['upload-btn'].classList.toggle('loading', loading);
    els['drop-zone']?.classList.toggle('uploading', loading);
  }

  function setUploadProgress(stage) {
    const panel = els['upload-progress'];
    if (!panel) return;
    if (!stage) {
      panel.classList.add('hidden');
      ['upload-step-scan', 'upload-step-extract', 'upload-step-ready'].forEach(id => {
        els[id]?.classList.remove('active', 'done');
      });
      return;
    }
    panel.classList.remove('hidden');
    const order = ['scan', 'extract', 'ready'];
    const idx = order.indexOf(stage);
    order.forEach((name, i) => {
      const el = els[`upload-step-${name}`];
      if (!el) return;
      el.classList.toggle('done', i < idx);
      el.classList.toggle('active', i === idx);
    });
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
      return 'Security scan: not run for this format.';
    }
    const s = security.stats;
    const clean = (s.harmless || 0) + (s.undetected || 0);
    return `Security scan (VirusTotal): ${security.verdict} — ${clean} engines clean.`;
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

  function renderCapabilityStrip() {
    const strip = els['capability-strip'];
    if (!strip) return;

    let message = '';
    let cls = 'static';
    if (serverConfig.mode === 'express' || serverConfig.mode === 'functions') {
      cls = 'full';
      const parts = ['Full pipeline'];
      if (serverConfig.virusTotal) parts.push('VirusTotal scan');
      if (serverConfig.openAi) parts.push('AI Coach');
      else parts.push('AI Coach off (set OPENAI_API_KEY)');
      message = parts.join(' · ');
    } else {
      message =
        'Basic scores only on static hosting — run npm start locally or use Firebase Functions for upload scan and AI Coach.';
    }

    strip.className = `capability-strip visible ${cls}`;
    strip.textContent = message;
  }

  function setStep(step) {
    document.querySelectorAll('.stepper-btn').forEach(btn => {
      const n = Number(btn.dataset.step);
      btn.classList.toggle('active', n === step);
      btn.setAttribute('aria-current', n === step ? 'step' : 'false');
      if (btn.classList.contains('stepper-results')) {
        btn.disabled = !lastResults;
      }
    });

    document.querySelectorAll('.step-panel').forEach(panel => panel.classList.add('hidden'));
    const panel = document.getElementById(`step-panel-${step}`);
    panel?.classList.remove('hidden');

    if (step === 3 && lastResults) {
      els['results']?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setupSourceTabs() {
    document.querySelectorAll('.source-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.source-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.source-panel').forEach(p => p.classList.add('hidden'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panel = document.getElementById(`source-${tab.dataset.source}`);
        panel?.classList.remove('hidden');
      });
    });
  }

  function setupStepper() {
    document.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.dataset.step);
        if (btn.disabled) return;
        if (step === 2 && !canProceedToStep2()) return;
        setStep(step);
      });
    });
    els['goto-step-2']?.addEventListener('click', () => {
      if (!canProceedToStep2()) {
        showAlert(`Add at least ${LIMITS.minChars} characters before continuing.`);
        return;
      }
      setStep(2);
    });
    els['back-step-1']?.addEventListener('click', () => setStep(1));
    els['analyze-again-btn']?.addEventListener('click', () => setStep(2));
  }

  function canProceedToStep2() {
    const chars = els['resume-text'].value.trim().length;
    return chars >= LIMITS.minChars && chars <= LIMITS.maxChars;
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

  function applyExtractedText(text, sourceLabel, security) {
    els['resume-text'].value = text;
    els['drop-zone']?.classList.add('has-content');
    updateLiveStats();
    persistDraft();
    const main = sourceLabel
      ? `Imported from ${sourceLabel} (${text.length.toLocaleString()} characters)`
      : 'Import complete';
    setUploadStatus(main, 'success', formatSecurityLine(security));
  }

  async function handleFileUpload(file) {
    if (!file) return;
    hideAlert();
    setUploadStatus('', '');
    setUploadProgress(null);

    if (!isSupportedFile(file.name)) {
      showAlert(`Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (serverConfig.maxUploadMb && file.size > serverConfig.maxUploadMb * 1024 * 1024) {
      showAlert(`File exceeds the ${serverConfig.maxUploadMb} MB limit.`);
      return;
    }

    const ext = getExtension(file.name);
    const needsServerScan = !LOCAL_EXTENSIONS.has(ext);
    setUploading(true);
    if (needsServerScan) setUploadProgress('scan');

    try {
      let text = '';
      let security = null;

      if (LOCAL_EXTENSIONS.has(ext)) {
        text = await extractFileLocally(file);
        security = { scanned: false, skipped: true };
        setUploadProgress('ready');
      } else {
        setUploadProgress('extract');
        const apiResult = await ApiClient.fetchApi('/api/extract-resume', {
          method: 'POST',
          body: (() => {
            const fd = new FormData();
            fd.append('file', file);
            return fd;
          })(),
        });
        text = apiResult.text;
        security = apiResult.security;
        setUploadProgress('ready');
      }

      text = text.trim();
      if (text.length < 10) {
        throw new Error('Not enough text was extracted. Try another format or paste manually.');
      }

      applyExtractedText(text, file.name, security);
      showToast(
        security?.scanned && security.verdict === 'clean'
          ? `Loaded ${file.name} — passed security scan.`
          : `Loaded ${file.name} successfully.`,
        'success'
      );
    } catch (err) {
      const msg = err.message || 'Upload failed.';
      setUploadStatus(msg, 'error');
      showAlert(msg);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(null), 800);
      if (els['file-upload']) els['file-upload'].value = '';
    }
  }

  async function loadHostedVersions() {
    const select = els['cv-version'];
    if (!select) return;
    try {
      const data = await ApiClient.fetchApi('/api/versions');
      select.innerHTML = '';
      (data.versions || ['default']).forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });
      if (lastHostedVersion) select.value = lastHostedVersion;
    } catch {
      select.innerHTML = '<option value="default">default</option>';
    }
  }

  async function loadHostedCv() {
    const version = els['cv-version']?.value || 'default';
    hideAlert();
    setUploading(true);
    setUploadStatus(`Loading hosted CV: ${version}…`, '');
    try {
      const data = await ApiClient.fetchApi('/api/extract-resume-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      lastHostedVersion = version;
      localStorage.setItem(STORAGE_KEYS.hostedVersion, version);
      applyExtractedText(data.text, `${version}.pdf`, data.security);
      document.querySelector('.source-tab[data-source="paste"]')?.click();
      showToast(`Loaded hosted CV version "${version}".`, 'success');
    } catch (err) {
      showAlert(err.message || 'Could not load hosted CV.');
    } finally {
      setUploading(false);
    }
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

    const canAnalyze = chars >= LIMITS.minChars && chars <= LIMITS.maxChars;
    if (els['analyze-btn'] && !els['analyze-btn'].classList.contains('loading')) {
      els['analyze-btn'].disabled = !canAnalyze;
    }
    if (els['goto-step-2']) els['goto-step-2'].disabled = !canAnalyze;

    els['resume-text'].setAttribute('aria-invalid', chars > 0 && !canAnalyze ? 'true' : 'false');
    updateLiveHints(text, chars, words);
    els['drop-zone']?.classList.toggle('has-error', chars > 0 && chars < LIMITS.minChars);
    els['drop-zone']?.classList.toggle('has-content', Boolean(text.trim()));
  }

  function updateLiveHints(text, chars, words) {
    const hints = [];
    if (!text.trim()) {
      els['live-hints'].innerHTML = '';
      return;
    }
    if (chars < LIMITS.minChars) {
      hints.push({ msg: `Add ${LIMITS.minChars - chars} more characters.`, cls: 'warn' });
    }
    if (words < LIMITS.minWords) {
      hints.push({ msg: 'Most resumes need 40+ words for meaningful results.', cls: 'warn' });
    }
    if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) hints.push({ msg: 'Email detected ✓', cls: 'ok' });
    if (/(^|\n)\s*[-•*–]\s/m.test(text))
      hints.push({ msg: 'Bullet formatting detected ✓', cls: 'ok' });
    if (/\d+[%]?/.test(text)) hints.push({ msg: 'Quantified metrics found ✓', cls: 'ok' });

    els['live-hints'].innerHTML = hints
      .map(h => `<div class="live-hint ${h.cls}">${escapeHtml(h.msg)}</div>`)
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

  function renderActionPlan(checks, suggestions) {
    const card = els['action-plan'];
    const list = els['action-plan-list'];
    if (!card || !list) return;

    const failed = (checks || []).filter(c => !c.passed).slice(0, 3);
    const topSuggestions = (suggestions || []).slice(0, 3);
    const items = [
      ...failed.map(c => ({ type: 'check', text: `${c.label}: ${c.hint}` })),
      ...topSuggestions.map(s => ({ type: 'suggestion', text: s.text })),
    ].slice(0, 5);

    if (!items.length) {
      card.classList.add('hidden');
      return;
    }

    list.innerHTML = items
      .map(
        (item, i) =>
          `<div class="action-plan-item" style="animation-delay:${i * 0.05}s"><span class="action-plan-type">${escapeHtml(item.type)}</span>${escapeHtml(item.text)}</div>`
      )
      .join('');
    card.classList.remove('hidden');
  }

  function renderJobMatch(jobMatch, aiInsights) {
    const panel = els['job-match-panel'];
    const tabBtn = els['job-tab-btn'];
    if (!panel || !jobMatch) {
      tabBtn?.classList.add('hidden');
      return;
    }

    tabBtn?.classList.remove('hidden');

    const list = (title, items, cls) => {
      if (!items?.length) {
        return `<div class="job-match-block"><h4>${escapeHtml(title)}</h4><p class="empty-note">None</p></div>`;
      }
      return `<div class="job-match-block"><h4>${escapeHtml(title)}</h4><ul class="job-match-list ${cls}">${items
        .map(item => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul></div>`;
    };

    let aiOverlap = '';
    if (
      aiInsights?.available &&
      aiInsights.missingKeywords?.length &&
      jobMatch.missingRequirements?.length
    ) {
      const overlap = aiInsights.missingKeywords.filter(kw =>
        jobMatch.missingRequirements.some(r => r.toLowerCase().includes(kw.toLowerCase()))
      );
      if (overlap.length) {
        aiOverlap = `<p class="job-match-ai-note">AI also suggests adding: ${overlap.map(escapeHtml).join(', ')}</p>`;
      }
    }

    panel.innerHTML = `
      <div class="job-match-score">
        <span class="job-match-value">${jobMatch.overallScore}%</span>
        <span class="job-match-label">requirement match (${jobMatch.requirementCount} detected)</span>
      </div>
      ${list('Found in your resume', jobMatch.foundRequirements, 'found')}
      ${list('Missing from resume', jobMatch.missingRequirements, 'missing')}
      ${list('Suggestions', jobMatch.suggestions, 'tips')}
      ${aiOverlap}
    `;
  }

  function renderAiInsights(aiInsights) {
    const panel = els['ai-insights-panel'];
    const tabBtn = els['ai-tab-btn'];
    if (!panel) return;

    if (!aiInsights?.available) {
      tabBtn?.classList.add('hidden');
      const hint =
        aiInsights?.error ||
        (aiInsights?.skipped
          ? 'Enable OPENAI_API_KEY on the server for AI coach insights.'
          : 'AI insights unavailable.');
      panel.innerHTML = `<p class="ai-placeholder">${escapeHtml(hint)}</p>`;
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

  function updateNextSteps() {
    const panel = els['next-steps'];
    if (!panel) return;
    panel.classList.remove('hidden');

    const compare = els['next-compare'];
    const resume = els['next-resume'];
    if (compare) {
      const v1 = lastHostedVersion || 'default';
      compare.href = `/compare?v1=${encodeURIComponent(v1)}&v2=default`;
    }
    if (resume) {
      resume.href = `/resume/${encodeURIComponent(lastHostedVersion || 'default')}`;
    }
  }

  function renderResults(data) {
    const { results, checks, suggestions, aiInsights, jobMatch } = data;
    lastResults = data;
    localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(data));

    els['overall-score'].textContent = `${results.overallScore}%`;
    els['overall-grade'].textContent = results.grade.replace('-', ' ');

    [
      ['technical-score', 'technical-bar', results.technicalScore],
      ['soft-score', 'soft-bar', results.softSkillsScore],
      ['management-score', 'management-bar', results.managementScore],
      ['practices-score', 'practices-bar', results.practicesScore],
    ].forEach(([scoreId, barId, value]) => {
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

    renderActionPlan(checks, suggestions);
    renderJobMatch(jobMatch, aiInsights);
    renderAiInsights(aiInsights);
    updateNextSteps();

    els['results'].classList.remove('hidden');
    document.querySelector('.stepper-btn[data-step="3"]')?.removeAttribute('disabled');
    setStep(3);
  }

  async function analyzeViaApi(text, targetRole, useAi, jobDescription) {
    return ApiClient.fetchApi('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetRole, useAi, jobDescription }),
    });
  }

  function analyzeLocally(text, targetRole, jobDescription) {
    const analyzer = new ResumeAnalyzer();
    const data = analyzer.analyze(text, { targetRole });
    if (!data.success) throw new Error(data.error);

    if (jobDescription?.trim() && window.JobDescriptionMatcher) {
      data.jobMatch = JobDescriptionMatcher.matchResumeToJob(text, jobDescription);
      data.meta = { ...data.meta, hasJobDescription: true };
    }

    return data;
  }

  async function runAnalysis() {
    hideAlert();
    const text = els['resume-text'].value.trim();
    const targetRole = els['target-role'].value;
    const jobDescription = els['job-description']?.value.trim() || '';

    if (!text) {
      showAlert('Please add resume text before analyzing.');
      setStep(1);
      return;
    }

    persistDraft();
    setLoading(true);

    try {
      const useAi = serverConfig.openAi && els['use-ai']?.checked !== false;
      let data;
      let usedLocalFallback = false;

      try {
        data = await analyzeViaApi(text, targetRole, useAi, jobDescription);
      } catch (err) {
        if (err instanceof ApiClient.ApiError && err.statusCode === 400) throw err;
        data = analyzeLocally(text, targetRole, jobDescription);
        data.aiInsights = { available: false, skipped: true, reason: 'local_only' };
        usedLocalFallback = true;
      }

      renderResults(data);

      if (usedLocalFallback) {
        showToast('Offline analysis — start the server for AI Coach and upload scan.', 'warning');
      } else {
        showToast(
          data.aiInsights?.available ? 'Analysis complete with AI coach!' : 'Analysis complete!',
          'success'
        );
      }
    } catch (err) {
      showAlert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function persistDraft() {
    try {
      localStorage.setItem(STORAGE_KEYS.draft, els['resume-text'].value);
      localStorage.setItem(STORAGE_KEYS.jobDescription, els['job-description']?.value || '');
    } catch {
      /* quota */
    }
  }

  function restoreDraft() {
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.draft);
      const jd = localStorage.getItem(STORAGE_KEYS.jobDescription);
      const hosted = localStorage.getItem(STORAGE_KEYS.hostedVersion);
      if (draft) {
        els['resume-text'].value = draft;
        updateLiveStats();
        showToast('Restored your saved resume draft.', 'info');
      }
      if (jd && els['job-description']) els['job-description'].value = jd;
      if (hosted) lastHostedVersion = hosted;
    } catch {
      /* ignore */
    }
  }

  function downloadReport() {
    if (!lastResults) {
      showAlert('Run an analysis first.');
      return;
    }
    const { results, checks, suggestions, jobMatch, aiInsights, meta } = lastResults;
    const lines = [
      '# Resume Analysis Report',
      '',
      `Generated: ${meta?.analyzedAt || new Date().toISOString()}`,
      `Target role: ${meta?.targetRole || 'general'}`,
      '',
      '## Scores',
      `- Overall: ${results.overallScore}% (${results.grade})`,
      `- Technical: ${results.technicalScore}%`,
      `- Soft skills: ${results.softSkillsScore}%`,
      `- Management: ${results.managementScore}%`,
      `- Best practices: ${results.practicesScore}%`,
      '',
      '## Checks',
      ...checks.map(c => `- [${c.passed ? 'x' : ' '}] ${c.label}: ${c.hint}`),
      '',
      '## Suggestions',
      ...suggestions.map(s => `- (${s.type}) ${s.text}`),
    ];

    if (jobMatch) {
      lines.push(
        '',
        '## Job match',
        `- Score: ${jobMatch.overallScore}%`,
        '- Found:',
        ...jobMatch.foundRequirements.map(r => `  - ${r}`),
        '- Missing:',
        ...jobMatch.missingRequirements.map(r => `  - ${r}`)
      );
    }

    if (aiInsights?.available) {
      lines.push(
        '',
        '## AI Coach',
        aiInsights.summary || '',
        ...(aiInsights.strengths || []).map(s => `- Strength: ${s}`),
        ...(aiInsights.improvements || []).map(s => `- Improve: ${s}`)
      );
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `resume-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Report downloaded.', 'success');
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
        document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
      });
    });
  }

  function setupDropZone() {
    const zone = els['drop-zone'];
    if (!zone) return;
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
    els['upload-btn']?.addEventListener('click', () => els['file-upload']?.click());
    els['file-upload']?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    });
    els['load-cv-btn']?.addEventListener('click', loadHostedCv);
  }

  function setupTipsDrawer() {
    els['tips-toggle']?.addEventListener('click', () => {
      const open = els['tips-drawer']?.classList.toggle('collapsed');
      els['tips-toggle']?.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  async function loadServerConfig() {
    try {
      const response = await fetch('/api/analyzer/config');
      if (!response.ok) {
        serverConfig.mode = 'static';
        renderCapabilityStrip();
        return;
      }
      serverConfig = await response.json();
      if (serverConfig.openAi) els['ai-toggle-label']?.classList.remove('hidden');
      else els['ai-toggle-label']?.classList.add('hidden');
    } catch {
      serverConfig.mode = 'static';
    }
    renderCapabilityStrip();
  }

  function handleHashNavigation() {
    if (window.location.hash === '#target') setStep(2);
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupTabs();
    setupDropZone();
    setupUpload();
    setupSourceTabs();
    setupStepper();
    setupTipsDrawer();
    loadServerConfig();
    loadHostedVersions();
    restoreDraft();
    handleHashNavigation();

    els['analyze-btn']?.addEventListener('click', runAnalysis);
    els['download-report-btn']?.addEventListener('click', downloadReport);
    els['sample-btn']?.addEventListener('click', () => {
      els['resume-text'].value = SAMPLE_RESUME;
      updateLiveStats();
      persistDraft();
      hideAlert();
    });
    els['clear-btn']?.addEventListener('click', () => {
      els['resume-text'].value = '';
      if (els['job-description']) els['job-description'].value = '';
      els['results'].classList.add('hidden');
      els['action-plan']?.classList.add('hidden');
      els['next-steps']?.classList.add('hidden');
      lastResults = null;
      setUploadStatus('', '');
      localStorage.removeItem(STORAGE_KEYS.draft);
      localStorage.removeItem(STORAGE_KEYS.jobDescription);
      localStorage.removeItem(STORAGE_KEYS.results);
      document.querySelector('.stepper-btn[data-step="3"]')?.setAttribute('disabled', 'true');
      updateLiveStats();
      hideAlert();
      setStep(1);
      els['resume-text'].focus();
    });

    els['resume-text']?.addEventListener('input', () => {
      updateLiveStats();
      persistDraft();
    });
    els['job-description']?.addEventListener('input', persistDraft);
    els['resume-text']?.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        runAnalysis();
      }
    });
    document.querySelector('.alert-close')?.addEventListener('click', hideAlert);

    updateLiveStats();
  });
})();
