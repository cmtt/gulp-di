const requireDir = require('require-dir');

/**
 * @method readDirectory
 * @param {string} directory
 * @param {Object} options
 * @return {object}
 */

const readDirectory = (directory, options = {}) => requireDir(directory, options);

module.exports = readDirectory;
