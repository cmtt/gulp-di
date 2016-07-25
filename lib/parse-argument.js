'use strict';
const introspect = require('introspect');

/**
 * Parses the given dependency injection notation, either using a function
 * with dependencies as its parameters or using the minification-safe with an
 * array.
 * @method $parseArg
 * @private
 * @param {function|Array} arg
 * @return {object}
 */

function $parseArg (arg) {
  let params = [];
  let fn = null;
  // ['dependency', function (dependency) {}]

  if (typeof arg === 'object' && typeof arg.length === 'number') {
    let l = arg.length;
    params = arg.slice(0, l - 1);
    fn = arg[l - 1];
  } else if (typeof arg === 'function') {   // function (dependency) {}
    params = introspect(arg);
    fn = arg;
  } else {
    throw new SyntaxError('Invalid dependency injection notation');
  }

  if (typeof fn !== 'function') {
    throw new Error('Function expected');
  }

  for (let i = 0, l = params.length; i < l; i++) {
    if (typeof params[i] !== 'string') {
      throw new Error('Invalid dependency notation, string expected');
    }
    params[i] = params[i].trim();
    if (params[i].length === 0) {
      throw new Error('Invalid dependency notation, empty string provided');
    }
  }

  return { fn, params };
}

module.exports = $parseArg;
