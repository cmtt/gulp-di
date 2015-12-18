module.exports = function (gulp, paths, mocha) {

  gulp.task('mocha', function () {

    // Runs the unit tests using Mocha

    return gulp.src(paths.specs)
    .pipe(mocha());
  });

};