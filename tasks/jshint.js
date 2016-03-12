module.exports = (gulp, jshint, paths) => {
  gulp.task('jshint', () => {
    return gulp.src(paths.src.concat(paths.tasks))
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  });
};
