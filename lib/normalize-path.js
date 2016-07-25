const path = require('path');

function normalizePath (parentDir, directory) {
  if (!path.isAbsolute(directory)) {
    directory = path.resolve(parentDir, directory);
  }
  return directory;
}

module.exports = normalizePath;
