const path = require('path');

function normalizePath (parentDir, directory) {
  if (!path.isAbsolute(directory)) {
    return path.resolve(parentDir, directory);
  }
  return directory;
}

module.exports = normalizePath;
