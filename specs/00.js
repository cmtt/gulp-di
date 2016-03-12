'use strict';
const path = require('path');
global.assert = require('assert');
global.basePath = path.join.bind(path, __dirname, '..');

const diPath = global.basePath('index.js');
global.GulpDI = require(diPath);

/**
 * @method getGulpInstance
 */

global.getGulpInstance = () => {
  delete require.cache[require.resolve('gulp')];
  delete require.cache[require.resolve('gulp-util')];
  return require('gulp');
};

/**
 * @method getDiInstance
 */

global.getDiInstance = (gulp, config) => {
  config = config || {};
  config.parentDir = basePath();
  delete require.cache[require.resolve(diPath)];
  global.GulpDI = require(diPath);
  return new global.GulpDI(gulp, config);
};
