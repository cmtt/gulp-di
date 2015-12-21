var path = require('path');

global.assert = require('assert');
global.basePath = path.join.bind(path, __dirname, '..');
global.GulpDI = require(global.basePath('index.js'));

global.getGulpInstance = function () {
  delete require.cache[require.resolve('gulp')];
  return require('gulp');
};

global.getDiInstance = function (gulp, config) {
  return new global.GulpDI(gulp, config);
};