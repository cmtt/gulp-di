module.exports = function (gulp, Package, basePath) {
  gulp.task('default', ['jshint','mocha', 'help']);
};