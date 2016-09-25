'use strict';

module.exports = (gulp, Package, basePath) => {
  gulp.task('default', ['mocha', 'semistandard']);
};
