module.exports = function (Package, basePath, gulp, taskInfo) {
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

  gulp.task('task-info', function () {

    /**
     * Example logging task information from contrib/help.js
     */
    console.log(Package.name+'\'s task information: ');
    console.log(taskInfo);
  });

};
