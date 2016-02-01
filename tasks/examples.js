module.exports = function (Package, basePath,chalk, log, gulp, taskInfo, gutil, runningTasks) {
  // The order of dependencies does not matter ^^^^

  var path = require('path');

  gulp.task('log-path', function () {

    /**
     * Example using the build-in constant Package from your the current
     * package.json as well as the path resolving helper basePath.
     */

    console.log(Package.name+'\'s location: ', basePath());
    console.log('this file\'s location: ', basePath('tasks', path.basename(__filename)));

  });

  // You can declare multiple gulp tasks in each file.

  gulp.task('task-info', function () {

    /**
     * Example logging task information from contrib/help.js
     */

    console.log(Package.name+'\'s task information: ');
    console.log(taskInfo);
  });

  gulp.task('a', function () {});
  gulp.task('b',['c', 'a'], function () {});
  gulp.task('c', function () {});

  gulp.task('info', function () {

    /**
     * Demonstrates logging currently running tasks.
     *
     * If you'd define tasks a, b, c (where b would depend on c and a),
     * runningTasks() would return:
     * $ gulp a
     * // ['a']
     * $ gulp b
     * // ['c','a','b']
     * $ gulp c
     * // ['c']
     */

    var line = [
      'Building' ,
      chalk.magenta(Package.name),
      Package.version ,
      '- running tasks:' ,
      chalk.cyan(runningTasks().join(', '))
    ];
    log(line.join(' '));
  });

};
