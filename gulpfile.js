/**
 * This is currently solely an example on how you could use
 * gulp-di in many ways.
 */

var gulp = require('gulp');
var di = require('./')(gulp, {
  DEBUG: true
})
.modules('./modules')
.tasks('./tasks')
// .task(function (noDef) {
//   // This should fail if you un-comment it
// })
.resolve();

// Using the old API, comment will become available with "gulp help".
// In order to use this feature, you need to call gulp.task AFTER
// gulp-di though.

gulp.task('wait', function (done) {
  /**
   * Waits for one second, features a
   * multi-line comment (see Gulpfile.js).
   */
  di.inject(function () {
    setTimeout(done, 1e3);
  });
});
