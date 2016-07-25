const requireDir = require('require-dir');

/**
 * @method readDirectory
 * @param {string} directory
 * @param {Boolean} camelcase
 * @return {object}
 */

function readDirectory (directory, camelcase) {
  return requireDir(directory, { camelcase: !!camelcase });
}

module.exports = readDirectory;
