'use strict';

/**
 * @method getPath
 * @param {string} key
 * @returns {*|null}
 */

function getPath (obj, key) {
  key = typeof key !== 'undefined' ? key : null;

  if (key === null) {
    return obj;
  } else if (/\./.test(key) === false) {
    return obj[key];
  }

  /**
   * Returns a payload or a nested property of any provided payload.
   * @method step
   * @private
   * @param {*} object
   * @param {string[]} depPath
   */

  function step (object, depPath) {
    return depPath.length ? step(object[depPath.shift()], depPath) : object;
  }

  let depPath = key.split(/\./g);
  return step(obj, depPath);
}

module.exports = getPath;
