'use strict';

/**
 * This is currently solely an example on how you could use
 * gulp-di in many ways.
 *
 * Try running
 *
 * $ gulp
 * $ gulp help
 * $ gulp log-path
 * $ gulp b info wait
 */

const gulp = require('gulp');
let di = require('./')(gulp, {
  // DEBUG: true
  // lazy : false
})
.modules('./modules')
.tasks('./tasks')
// .task(function (noDef) {
//   // This should fail if you un-comment it
// })
.resolve();

// Using gulp's task(), comments will become available with "gulp help".
//
// In order to use this feature, you'll need to call gulp.task() AFTER
// gulp-di though.

gulp.task('wait', (done) => {
  /**
   * Waits for one second, features a
   * multi-line comment (see gulpfile.js).
   */
  di.inject(() => setTimeout(done, 1e3));
});
