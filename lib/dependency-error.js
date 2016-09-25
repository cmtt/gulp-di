'use strict';

/**
 * @method DependencyError
 * @private
 * @param {string} id
 */

const DependencyError = function (id) {
  return new Error('Unknown dependency: ' + id);
};

module.exports = DependencyError;
