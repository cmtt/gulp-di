const requireDir = require('require-dir');

/**
 * @method readDirectory
 * @param {string} directory
 * @param {Boolean} camelcase
 * @return {object}
 */

const readDirectory = (directory, camelcase) => requireDir(directory, { camelcase: !!camelcase });

module.exports = readDirectory;
