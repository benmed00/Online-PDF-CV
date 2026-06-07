#!/usr/bin/env node

/**
 * Creates labels, milestone, and issues on benmed00/Online-PDF-CV (fork).
 * Cross-references ben-git-code/Online-PDF-CV PR #3.
 */

const { execFileSync } = require('child_process');

const REPO = 'benmed00/Online-PDF-CV';
const UPSTREAM_PR = 'ben-git-code/Online-PDF-CV#3';

const LABELS = [
  { name: 'type: bug', color: 'd73a4a', description: 'Something is broken' },
  { name: 'type: enhancement', color: 'a2eeef', description: 'New feature or improvement' },
  { name: 'type: documentation', color: '0075ca', description: 'Documentation only' },
  { name: 'type: testing', color: 'bfd4f2', description: 'Tests and quality assurance' },
  { name: 'type: ci/cd', color: '5319e7', description: 'Continuous integration and deployment' },
  { name: 'type: security', color: 'e11d21', description: 'Security-related change' },
  { name: 'type: refactor', color: 'd4c5f9', description: 'Code restructuring without behavior change' },
  { name: 'type: infrastructure', color: 'fbca04', description: 'Logging, errors, tooling, runtime' },
  { name: 'type: deployment', color: '006b75', description: 'Firebase and hosting' },
  { name: 'priority: critical', color: 'b60205', description: 'Must fix before release' },
  { name: 'priority: high', color: 'd93f0b', description: 'Important for release' },
  { name: 'priority: medium', color: 'fbca04', description: 'Should be addressed soon' },
  { name: 'priority: low', color: '0e8a16', description: 'Nice to have' },
  { name: 'status: resolved', color: '0e8a16', description: 'Fixed or completed' },
  { name: 'status: in-progress', color: '1d76db', description: 'Actively being worked on' },
  { name: 'status: blocked', color: '000000', description: 'Blocked by external dependency' },
  { name: 'area: express', color: 'c5def5', description: 'Express server and routes' },
  { name: 'area: firebase', color: 'ff9900', description: 'Firebase hosting and config' },
  { name: 'area: playwright', color: '2ea043', description: 'End-to-end usability tests' },
  { name: 'area: docs', color: '0075ca', description: 'README, wiki, and media assets' },
  { name: 'area: dependencies', color: 'ededed', description: 'npm packages and audit' },
  { name: 'milestone: v3.6.2', color: '5319e7', description: 'Platform hardening release track' },
  { name: 'pr-3', color: '6f42c1', description: 'Related to upstream PR #3' },
];

const ISSUES = [
  {
    title: '[RESOLVED] Merge conflicts prevented application startup',
    state: 'closed',
    labels: ['type: bug', 'priority: critical', 'status: resolved', 'pr-3', 'area: express'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nMerge conflict markers in \`app.js\`, \`package.json\`, views, and \`.gitignore\` blocked parsing and tests.`,
  },
  {
    title: '[RESOLVED] Express 5 incompatible route syntax and unreachable 404 handler',
    state: 'closed',
    labels: ['type: bug', 'priority: high', 'status: resolved', 'pr-3', 'area: express'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nReplaced \`app.all('*')\` wildcards, optional params, and \`createError\` usage with Express 5-compatible routing.`,
  },
  {
    title: '[RESOLVED] Firebase production could not serve /docs, /analyzer, /compare',
    state: 'closed',
    labels: ['type: enhancement', 'priority: high', 'status: resolved', 'pr-3', 'area: firebase'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nAdded \`npm run build\` static generation and Firebase rewrites for tools and API JSON.`,
  },
  {
    title: '[RESOLVED] npm audit reported 11 vulnerabilities',
    state: 'closed',
    labels: ['type: security', 'priority: high', 'status: resolved', 'pr-3', 'area: dependencies'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nRegenerated lockfile and removed unused packages. Current audit: 0 vulnerabilities.`,
  },
  {
    title: '[RESOLVED] Missing Playwright usability coverage and media artifacts',
    state: 'closed',
    labels: ['type: testing', 'priority: high', 'status: resolved', 'pr-3', 'area: playwright'],
    body: `Resolved in ${UPSTREAM_PR}.\n\n14 Playwright tests, screenshots in \`docs/assets/screenshots/\`, videos in \`docs/assets/videos/\`.`,
  },
  {
    title: '[RESOLVED] CI workflow targeted wrong branch (main vs master)',
    state: 'closed',
    labels: ['type: ci/cd', 'priority: medium', 'status: resolved', 'pr-3'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nGitHub Actions now trigger on \`master\` with build, lint, test, coverage, and e2e jobs.`,
  },
  {
    title: '[RESOLVED] Centralized logging and operational error handling',
    state: 'closed',
    labels: ['type: infrastructure', 'priority: high', 'status: resolved', 'pr-3', 'area: express'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nWinston logging, AppError, hybrid JSON/HTML error handler, process crash hooks.`,
  },
  {
    title: '[RESOLVED] Path traversal risk on /resume/:version',
    state: 'closed',
    labels: ['type: security', 'priority: high', 'status: resolved', 'pr-3', 'area: express'],
    body: `Resolved in ${UPSTREAM_PR}.\n\nVersion slugs validated with \`/^[a-z0-9-]+$/\` before serving PDFs.`,
  },
  {
    title: 'Enable GitHub Issues on ben-git-code/Online-PDF-CV upstream repository',
    state: 'open',
    labels: ['type: infrastructure', 'priority: medium', 'status: blocked', 'pr-3'],
    body: `Upstream repo has \`has_issues: false\`. Enable in Settings → General → Features.\n\nRelated: ${UPSTREAM_PR}`,
  },
  {
    title: 'Enable GitHub Actions checks for fork pull requests on upstream',
    state: 'open',
    labels: ['type: ci/cd', 'priority: high', 'status: in-progress', 'pr-3'],
    body: `CI workflows were not present on upstream \`master\`, so ${UPSTREAM_PR} showed no checks.\n\nMaintainer action: Settings → Actions → General → allow fork PR workflows.\n\nThis PR adds \`ci.yml\` with push, pull_request, and workflow_dispatch triggers.`,
  },
  {
    title: 'Firebase static fallback when resume version PDF is missing',
    state: 'open',
    labels: ['type: enhancement', 'priority: high', 'pr-3', 'area: firebase'],
    body: `Express falls back to \`resume.pdf\`; Firebase rewrite returns 404 for missing files.\n\nRelated: ${UPSTREAM_PR}`,
  },
  {
    title: 'Sync wiki/ source to GitHub Wiki',
    state: 'open',
    labels: ['type: documentation', 'priority: medium', 'pr-3', 'area: docs'],
    body: `Follow \`wiki/Sync-Wiki.md\` after merge of ${UPSTREAM_PR}.`,
  },
  {
    title: 'Remove or integrate unused Firebase client scaffolding',
    state: 'open',
    labels: ['type: refactor', 'priority: low', 'pr-3', 'area: firebase'],
    body: `Files: \`src/lib/firebase.ts\`, \`public/js/firebase-config.js\`. Related: ${UPSTREAM_PR}`,
  },
  {
    title: 'Automate GitHub Wiki sync from wiki/ folder',
    state: 'open',
    labels: ['type: ci/cd', 'priority: low', 'pr-3', 'area: docs'],
    body: `Future improvement tracked from ${UPSTREAM_PR} roadmap.`,
  },
];

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function ghJson(args) {
  return JSON.parse(gh(args));
}

function ensureLabel(label) {
  try {
    gh(['label', 'create', label.name, '--repo', REPO, '--color', label.color, '--description', label.description, '--force']);
    console.log(`Label: ${label.name}`);
  } catch (error) {
    console.error(`Label failed: ${label.name}`, error.message);
  }
}

function ensureMilestone() {
  const milestones = ghJson(['api', `repos/${REPO}/milestones`, '--paginate']);
  const existing = milestones.find(item => item.title === 'v3.6.2 — Platform Hardening');
  if (existing) {
    console.log(`Milestone exists: #${existing.number}`);
    return existing.number;
  }

  const created = ghJson([
    'api',
    '-X',
    'POST',
    `repos/${REPO}/milestones`,
    '-f',
    'title=v3.6.2 — Platform Hardening',
    '-f',
    'description=Platform hardening, Firebase static build, Playwright usability, and documentation (PR #3)',
    '-f',
    'state=open',
    '-f',
    'due_on=2026-06-30T23:59:59Z',
  ]);
  console.log(`Milestone created: #${created.number}`);
  return created.number;
}

function createIssue(issue, milestoneNumber) {
  const labels = issue.labels.join(',');
  const args = [
    'issue',
    'create',
    '--repo',
    REPO,
    '--title',
    issue.title,
    '--body',
    issue.body,
    '--label',
    labels,
    '--milestone',
    String(milestoneNumber),
  ];

  const url = gh(args);
  const issueNumber = url.split('/').pop();

  if (issue.state === 'closed') {
    gh(['issue', 'close', issueNumber, '--repo', REPO, '--comment', `Resolved by ${UPSTREAM_PR}.`]);
  }

  console.log(`${issue.state.toUpperCase()}: ${url}`);
  return issueNumber;
}

function main() {
  LABELS.forEach(ensureLabel);
  const milestoneNumber = ensureMilestone();
  const issueNumbers = ISSUES.map(issue => createIssue(issue, milestoneNumber));
  console.log(`Created/updated ${issueNumbers.length} issues in ${REPO}`);
}

main();
