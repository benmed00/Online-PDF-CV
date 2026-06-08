#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');

function run(command) {
  return execSync(command, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(PKG_PATH, 'utf8')).version;
}

function writePackageVersion(version) {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatVersion(parts) {
  return `${parts.major}.${parts.minor}.${parts.patch}`;
}

function compareVersions(a, b) {
  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] > b[key]) return 1;
    if (a[key] < b[key]) return -1;
  }
  return 0;
}

function bumpVersion(version, bumpType) {
  const parts = parseVersion(version);
  if (bumpType === 'major') {
    return formatVersion({ major: parts.major + 1, minor: 0, patch: 0 });
  }
  if (bumpType === 'minor') {
    return formatVersion({ ...parts, minor: parts.minor + 1, patch: 0 });
  }
  return formatVersion({ ...parts, patch: parts.patch + 1 });
}

function getLatestTag() {
  try {
    return run('git describe --tags --abbrev=0 --match "v*"');
  } catch {
    return null;
  }
}

function getTagVersion(tag) {
  return tag.replace(/^v/, '');
}

function getCommitsSinceTag(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const output = run(`git log ${range} --pretty=format:%s`);
  return output ? output.split('\n').filter(Boolean) : [];
}

function getRequiredBump(commits) {
  if (commits.length === 0) {
    return null;
  }

  let bump = 'patch';

  for (const subject of commits) {
    const breaking =
      subject.includes('BREAKING CHANGE') ||
      /^(\w+)(\([^)]+\))?!:/.test(subject) ||
      /^(\w+)!:/.test(subject);

    if (breaking) {
      return 'major';
    }

    if (/^feat(\(|:)/.test(subject)) {
      bump = 'minor';
    }
  }

  return bump;
}

function getMinimumVersion(baseVersion, bumpType) {
  return bumpVersion(baseVersion, bumpType);
}

function parseArgs(argv) {
  let explicitBump = null;
  if (argv.includes('--patch')) explicitBump = 'patch';
  if (argv.includes('--minor')) explicitBump = 'minor';
  if (argv.includes('--major')) explicitBump = 'major';

  const bumpIndex = argv.indexOf('--bump');
  if (bumpIndex !== -1 && argv[bumpIndex + 1]) {
    explicitBump = argv[bumpIndex + 1];
  }

  return {
    check: argv.includes('--check'),
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
    explicitBump,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const latestTag = getLatestTag();
  const baseVersion = latestTag ? getTagVersion(latestTag) : '0.0.0';
  const currentVersion = readPackageVersion();

  if (args.explicitBump && !args.check && !args.dryRun) {
    const forcedVersion = bumpVersion(currentVersion, args.explicitBump);
    writePackageVersion(forcedVersion);
    console.log(
      `Updated package.json: ${currentVersion} -> ${forcedVersion} (${args.explicitBump} bump)`
    );
    return;
  }

  const commits = getCommitsSinceTag(latestTag);
  const requiredBump = args.explicitBump || getRequiredBump(commits);

  if (!requiredBump) {
    console.log(
      latestTag
        ? `No commits since ${latestTag}. package.json stays at ${currentVersion}.`
        : `No semver tag found. package.json stays at ${currentVersion}.`
    );
    return;
  }

  const targetVersion = getMinimumVersion(baseVersion, requiredBump);

  if (args.check) {
    if (compareVersions(parseVersion(currentVersion), parseVersion(targetVersion)) < 0) {
      console.error(
        `version:check failed — package.json is ${currentVersion}, but commits since ${latestTag || 'repo start'} require at least ${targetVersion} (${requiredBump} bump).`
      );
      console.error('Run: npm run version:sync');
      process.exit(1);
    }

    console.log(
      `version:check passed — ${currentVersion} satisfies ${requiredBump} bump since ${latestTag || 'start'}.`
    );
    return;
  }

  if (compareVersions(parseVersion(currentVersion), parseVersion(targetVersion)) >= 0) {
    console.log(`package.json already at ${currentVersion} (required >= ${targetVersion}).`);
    return;
  }

  if (args.dryRun) {
    console.log(
      `Would bump package.json: ${currentVersion} -> ${targetVersion} (${requiredBump} since ${latestTag || 'start'})`
    );
    return;
  }

  writePackageVersion(targetVersion);
  console.log(
    `Updated package.json: ${currentVersion} -> ${targetVersion} (${requiredBump} since ${latestTag || 'start'})`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

module.exports = {
  bumpVersion,
  compareVersions,
  getCommitsSinceTag,
  getLatestTag,
  getRequiredBump,
  parseVersion,
};
