module.exports = (gulp, paths, mocha) => {

  gulp.task('mocha', () => {

    // Runs the unit tests using Mocha

    return gulp.src(paths.specs, { read : false })
    .pipe(mocha({}));
  });

};
