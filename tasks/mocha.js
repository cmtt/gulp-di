'use strict';
module.exports = function (gulp, paths) {
  gulp.task('pre-test', () => {
    const istanbul = this.byId('istanbul');
    return gulp.src(paths.istanbul)
      // Covering files
      .pipe(istanbul())
      // Force `require` to return covered files
      .pipe(istanbul.hookRequire());
  });

  gulp.task('mocha', ['pre-test'], () => {
    const mocha = this.byId('mocha');
    const istanbul = this.byId('istanbul');

    // Runs the unit tests using Mocha

    return gulp.src(paths.mocha, { read: false })
    .pipe(mocha({}))
    .pipe(istanbul.writeReports());
  });
};
