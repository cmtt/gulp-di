module.exports = function (Package, basePath, gulp) {
  // The order of dependencies does not matter ^^^^

  gulp.task('log-path', function () {

    /**
     * Example using the build-in constant Package from your the current
     * package.json as well as the path resolving helper basePath.
     */

    console.log(Package.name+'\'s location: ', basePath());
    console.log('this file\'s location: ', basePath('tasks', __filename));

  });

};
