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
  delete require.cache[require.resolve('undertaker')];
  delete require.cache[require.resolve('undertaker-registry')];
  delete require.cache[require.resolve('last-run')];
  const gulp = require('gulp');
  gulp.on('error', (e) => {
    console.log(e.error);
    throw new Error(`Gulp runtime error:\n${JSON.stringify(e)}\n`);
  });
  return gulp;
};

/**
 * @method getDiInstance
 */

global.getDiInstance = (gulp, config) => {
  delete require.cache[require.resolve(diPath)];
  global.GulpDI = require(diPath);
  return new global.GulpDI(gulp, config);
};

global.hasTask = (gulp, taskId) => {
  const registry = gulp._registry;
  const tasks = registry.tasks();
  return taskId in tasks;
};
