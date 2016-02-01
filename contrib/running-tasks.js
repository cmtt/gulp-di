/*jshint -W089 */

module.exports = function RunningTasks (gulp, gutil, log) {

  var DEBUG = this.options.DEBUG;

  /**
   * Adds a function returning an array of strings, containing all current
   * Gulp tasks, including dependencies.
   *
   * Use it as following:
   *
   * ````js
   * module.exports = function (gulp, log, Package, runningTasks) {
   *   gulp.task('info', function () {
   *     log('Building ' + chalk.magenta(Package.name) + ', running: ' + chalk.cyan(runningTasks().join(' ')));
   *   });
   * }
   * ````
   *
   * This module is currently experimental.
   */

  if (DEBUG) {
    log('Adding runningTasks helper...');
  }

  this.provide('runningTasks', function () {
    var tasks = [];
    var args = gutil.env._;
    var taskNames = Object.keys(gulp.tasks);

    // Filter all available task names using gutil.env._

    var cliTasks = taskNames.filter(function (name) {
      return !!~args.indexOf(name);
    });

    // Include the names of depending tasks

    for (var i = 0, l = cliTasks.length; i < l; i++) {
      var name = cliTasks[i];
      var task = gulp.tasks[name];
      tasks = tasks.concat(task.dep);
      tasks.push(task.name);
    }
    return tasks;
  });

};