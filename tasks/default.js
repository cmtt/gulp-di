'use strict';

module.exports = (gulp, Package, basePath) => {
  gulp.task('default', gulp.parallel('mocha', 'semistandard'));
};
