'use strict';
module.exports = function (gulp, paths) {
  gulp.task('pre-test', () => {
    let istanbul = this.byId('istanbul');
    return gulp.src(paths.istanbul)
      // Covering files
      .pipe(istanbul())
      // Force `require` to return covered files
      .pipe(istanbul.hookRequire());
  });

  gulp.task('mocha', ['pre-test'], () => {
    let mocha = this.byId('mocha');
    let istanbul = this.byId('istanbul');

    // Runs the unit tests using Mocha

    return gulp.src(paths.specs, { read: false })
    .pipe(mocha({}))
    .pipe(istanbul.writeReports());
  });
};
