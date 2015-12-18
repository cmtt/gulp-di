/*jshint -W089 */

module.exports = function HelpTask (gulp, Package, log, chalk) {

  /**
   * Modifies the gulp.task() function and builds a list of all tasks.
   *
   * Adds a Gulp "help" task which lists them with additional information from
   * function comments.
   *
   * Please use it as following:
   *
   * ````js
   * module.exports = function (gulp) {
   *   // Copies ./README.md to ./tmp
   *
   *   return gulp.src('./README.md')
   *   .pipe(gulp.dest('./tmp'));
   * };
   * ````
   *
   * This module needs to be injected before each successive require('gulp')
   * as it overwrites the "gulp.task" function.
   *
   * As such modifications might lead to unexpected behavior, this module is
   * experimental.
   */

  var parseFn = require('parse-function');
  var util = require('util');
  var extractComments = require('extract-comments');
  var _task = gulp.task;
  var taskInfo = {};
  var DEBUG = this.options.DEBUG;

  if (DEBUG) {
    log('Wrapping gulp.task() "gulp help" task...');
  }

  // Allows to use this hashmap as dependency

  this.provide('taskInfo', taskInfo);

  /**
   * Wraps the gulp.task() method, registeres information about the provided
   * tasks.
   * @method task
   * @param {string} id
   * @param {string[]} deps
   * @param {function} fn
   */

  gulp.task = function (id, deps, fn) {
    var args = [].slice.apply(arguments);

    if (typeof deps === 'function') {
      fn = arguments[1];
      deps = [];
    }

    var entry = null;

    if (typeof fn === 'function') {
      var info = parseFn(fn);
      entry = {
        name : id
      };
      entry.description = util.format('Runs the %s task (no description)', id);
      if (typeof info === 'object') {
        var comments = extractComments(info.body, {first : true});
        if (comments.length) {
          var comment = comments[0];
          entry.description = comment.lines || [comment.value];
        }
      }
    } else if (id === 'default') {
      entry = {
        name : 'default',
        description : 'Runs the default tasks: ' + deps.join(' ')
      };
    }


    if (entry) {
      if (deps.length) entry.deps = deps;
      if (DEBUG) {
        var line = ['Adding', chalk.cyan(entry.name), 'task'];
        if (deps.length) {
          line.push(' - depending on ',chalk.magenta(deps.join(' ')));
        }
        log.apply(chalk, line);
      }
      taskInfo[id] = entry;
    }

    return _task.apply(gulp, args);
  };

  // Registers the "help" task.

  gulp.task('help', function () {
    /* Prints an overview over all available Gulp tasks. */

    var util = require('util');
    var pad = require('pad');
    var lines = [''];
    var padding = 5;
    var paddingStr = new Array(padding).join(' ');

    lines.push(' ' + Package.name + ' ' + Package.version, '');

    if (Package.description && Package.description.length) {
      lines.push(' ' + Package.description, '');
    }

    var taskIds = Object.keys(taskInfo);
    var taskLengths = taskIds.map(function (id) { return id.length; });
    var maxLength = Math.max.apply(Math, taskLengths);

    for (var key in taskInfo) {
      var entry = taskInfo[key];
      var paddingLength = maxLength;
      var str = new Array(paddingLength+2).join(' ');
      var descriptionLine = util.format('Runs the %s task.', key);
      if (entry.description) descriptionLine = mapDescription(entry.description);
      lines.push(' ' + pad(entry.name, maxLength) + paddingStr + descriptionLine.join('\n').trim());
      lines.push('');
    }

    lines.forEach(function (line) {
      console.log(line);
    });

    /**
     * Maps the given array of comment lines by prepending whitespace if
     * necessary.
     * @method mapDescription
     * @param {string[]} lines
     * @return {string[]}
     * @private
     */

    function mapDescription(lines) {
      if (typeof lines === 'string') lines = [lines];
      return lines.map(function (line, index) {
        line = line.trim();
        return index ? str + paddingStr + line : line;
      });
    }
  });

};