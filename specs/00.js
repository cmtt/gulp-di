'use strict';
const path = require('path');

global.assert = require('assert');
global.basePath = path.join.bind(path, __dirname, '..');
global.GulpDI = require(global.basePath('index.js'));

/**
 * @method getGulpInstance
 */

global.getGulpInstance = () => {
  delete require.cache[require.resolve('gulp')];
  return require('gulp');
};

/**
 * @method getDiInstance
 */

global.getDiInstance = (gulp, config) => {
  return new global.GulpDI(gulp, config);
};
