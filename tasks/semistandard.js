module.exports = (gulp, semistandard, paths) => {
  gulp.task('semistandard', () => {
    return gulp.src(paths.src.concat(paths.tasks))
    .pipe(semistandard())
    .pipe(semistandard.reporter('default', {
      quiet: true
    }));
  });
};
