'use strict';
const parseFn = require('parse-function');

/**
 * Parses the given dependency injection notation, either using a function
 * with dependencies as its parameters or using the minification-safe with an
 * array.
 * @method $parseArg
 * @private
 * @param {function|Array} arg
 * @return {object}
 */

function $parseArg(arg) {
  let params = [];
  let fn = null;

  // ['dependency', function (dependency) {}]

  if (typeof arg === 'object' && typeof arg.length === 'number') {
    let l = arg.length;
    params = arg.slice(0, l -1);
    fn = arg[l-1];

  // function (dependency) {}

  } else if (typeof arg === 'function') {
    let info = parseFn(arg);
    params = info.arguments;
    fn = arg;
  } else {
    throw new SyntaxError('Invalid dependency injection notation');
  }

  if (typeof fn !== 'function') {
    throw new Error('Function expected');
  }

  for (let i = 0, l = params.length; i < l; i++) {
    params[i] = params[i].trim();
    if (typeof params[i] !== 'string' || params[i].length === 0) {
      throw new Error('Invalid dependency notation, string expected');
    }
  }

  return {
    fn : fn,
    params : params
  };
}

module.exports = $parseArg;
