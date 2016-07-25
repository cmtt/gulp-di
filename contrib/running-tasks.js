'use strict';

module.exports = function RunningTasks (gulp) {
  const DEBUG = this.options.DEBUG;
  let log = this.byId('log', true) || console.log.bind(console);
  let gutil = this.byId('gutil', true) || { env: { _: process.argv } };

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
    let tasks = [];
    let args = this.options.argv || gutil.env._;
    let taskNames = Object.keys(gulp.tasks);
    // Filter all available task names using gutil.env._

    let cliTasks = taskNames.filter((name) => args.indexOf(name) > -1);

    // Include the names of depending tasks

    for (let i = 0, l = cliTasks.length; i < l; i++) {
      let name = cliTasks[i];
      let task = gulp.tasks[name];
      tasks = tasks.concat(task.dep);
      tasks.push(task.name);
    }
    return tasks;
  });
};
