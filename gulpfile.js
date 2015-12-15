/**
 * This is currently solely an exmample on how you could use
 * with gulp-di in many ways.
 */

var gulp = require('gulp');
var di = require('./')(gulp, {
  throw : true
})
.injectValue('paths',function (basePath) {
  return {
    test : basePath('test', '**/*.js'),
    src : [
      basePath('index.js'),
      basePath('lib/**/*.js'),
      basePath('contrib/**/*.js')
    ]
  };
})
.tasks('./tasks')
// .task(function (noDef) {
  // This should fail as long as the "throw" option is not set to false.
// })
.resolve();

// Using the old API, comment will become available with "gulp help".
// In order to use this feature, you need to call gulp.task AFTER
// gulp-di though.

gulp.task('noop', function () {
  /**
   * Does nothing but showing this
   * multi-line comment (see Gulpfile.js).
   */
});

