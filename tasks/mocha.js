'use strict';
module.exports = function (gulp, paths, mocha, istanbul) {
  gulp.task('pre-test', () => {
    return gulp.src(paths.istanbul)
      // Covering files
      .pipe(istanbul())
      // Force `require` to return covered files
      .pipe(istanbul.hookRequire());
  });

  gulp.task('mocha', gulp.series('pre-test', () => {
    // Runs the unit tests using Mocha

    return gulp.src(paths.mocha, { read: false })
    .pipe(mocha({}))
    .pipe(istanbul.writeReports());
  }));
};
