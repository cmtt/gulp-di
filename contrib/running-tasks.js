'use strict';

module.exports = function RunningTasks (gulp) {
  const DEBUG = this.options.DEBUG;
  const log = this.byId('log', true) || console.log.bind(console);
  const gutil = this.byId('gutil', true) || { env: { _: process.argv } };

  /**
   * Adds a function returning an array of strings, containing all current
   * Gulp tasks, including dependencies.
   *
   * Use it as following:
   *
   * ````js
   * module.exports = function (gulp, log, Package, runningTasks) {
   *   gulp.task('info', function () {
   *     log('Building ' + chalk.magenta(Package.name) + ', running: ' + chalk.cyan(runningTasks().join(' ')))
   *   })
   * }
   * ````
   *
   * This module is currently experimental.
   */

  if (DEBUG) {
    log('Adding runningTasks helper...');
  }

  this.provide('runningTasks', () => {
    const registry = gulp._registry;
    const args = this.options.argv || gutil.env._;
    const taskNames = Object.keys(registry.tasks());
    // Filter all available task names using gutil.env._
    const cliTasks = taskNames.filter((name) => args.indexOf(name) !== -1);
    return cliTasks;
  });
};
