'use strict';

/**
 * @method DependencyError
 * @private
 * @param {string} id
 */

function DependencyError (id) {
  return Error('Unknown dependency: ' + id);
}

module.exports = DependencyError;
