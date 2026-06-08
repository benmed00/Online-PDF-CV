const {
  bumpVersion,
  compareVersions,
  getRequiredBump,
  parseVersion,
} = require('../scripts/sync-version');

describe('sync-version', () => {
  test('getRequiredBump returns major for breaking commits', () => {
    expect(getRequiredBump(['feat!: drop Express 4 support'])).toBe('major');
    expect(getRequiredBump(['feat(api): new route', 'BREAKING CHANGE: removed /legacy'])).toBe(
      'major'
    );
  });

  test('getRequiredBump returns minor when feat commits exist', () => {
    expect(getRequiredBump(['fix: lint', 'feat(analyzer): upload support'])).toBe('minor');
  });

  test('getRequiredBump returns patch for fix-only commits', () => {
    expect(getRequiredBump(['fix: handle missing slug', 'docs: update readme'])).toBe('patch');
  });

  test('getRequiredBump returns null when there are no commits', () => {
    expect(getRequiredBump([])).toBeNull();
  });

  test('bumpVersion increments semver parts', () => {
    expect(bumpVersion('4.0.0', 'patch')).toBe('4.0.1');
    expect(bumpVersion('4.0.0', 'minor')).toBe('4.1.0');
    expect(bumpVersion('4.0.0', 'major')).toBe('5.0.0');
  });

  test('compareVersions orders semver values', () => {
    expect(compareVersions(parseVersion('4.1.0'), parseVersion('4.0.0'))).toBe(1);
    expect(compareVersions(parseVersion('4.0.0'), parseVersion('4.1.0'))).toBe(-1);
  });
});
