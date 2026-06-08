const VERSION_PATTERN = /^[a-z0-9-]+$/;

function isValidVersion(version) {
  return VERSION_PATTERN.test(version);
}

module.exports = { isValidVersion, VERSION_PATTERN };
