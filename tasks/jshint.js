module.exports = (gulp, jshint, paths) => {
  gulp.task('jshint', () => {
    return gulp.src(paths.src.concat(paths.tasks))
    .pipe(jshint({
      esversion: 6,
      node: true
    }))
    .pipe(jshint.reporter('default'));
  });
};
