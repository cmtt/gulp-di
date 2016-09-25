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
   * @param {*} object
   * @param {string[]} depPath
   * @private
   */

  function step (object, depPath) {
    return depPath.length ? step(object[depPath.shift()], depPath) : object;
  }

  const depPath = key.split(/\./g);
  return step(obj, depPath);
}

module.exports = getPath;
