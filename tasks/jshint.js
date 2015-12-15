module.exports = function (gulp, jshint, paths) {
  gulp.task('jshint', function () {
    return gulp.src(paths.src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  });
};