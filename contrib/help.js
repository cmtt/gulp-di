'use strict';
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

  const parseFn = require('parse-function');
  const util = require('util');
  const extractComments = require('extract-comments');
  const _task = gulp.task;
  const taskInfo = {};
  const RGX_LF = /\r\n|\r|\n/g;
  const DEBUG = this.options.DEBUG;

  if (DEBUG) {
    log('Wrapping gulp.task() "gulp help" task...');
  }

  // Allows to use this hashmap as dependency

  this.provide('taskInfo', taskInfo);

  /**
   * Wraps the gulp.task() method, registers information about the provided
   * tasks.
   * @method task
   * @param {string} id
   * @param {string[]} deps
   * @param {function} fn
   */

  gulp.task = function (id, deps, fn) {
    let args = [].slice.apply(arguments);

    if (typeof deps === 'function') {
      fn = arguments[1];
      deps = [];
    }

    let entry = null;

    if (typeof fn === 'function') {
      let info = parseFn(fn);
      entry = {
        name : id
      };
      entry.description = util.format('Runs the %s task (no description)', id);
      let comments = extractComments(info.body, {first : true});
      if (comments.length) {
        let comment = comments[0];
        let lines = comment.raw
        .split(RGX_LF)
        .map(function (line) {
          return line.replace(/(\ )*(\*|\/+)/g, '');
        });
        entry.description = lines;
      }
    } else if (id === 'default') {
      entry = {
        name : 'default',
        description : 'Runs the default tasks: ' + deps.join(' ')
      };
    }


    if (entry) {
      entry.deps = deps;
      if (DEBUG) {
        let line = ['Adding', chalk.cyan(entry.name), 'task'];
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

    let util = require('util');
    let pad = require('pad');
    let lines = [''];
    let padding = 5;
    let paddingStr = new Array(padding).join(' ');

    lines.push(' ' + Package.name + ' ' + Package.version, '');

    if (Package.description && Package.description.length) {
      lines.push(' ' + Package.description, '');
    }

    let taskIds = Object.keys(taskInfo);
    let taskLengths = taskIds.map(function (id) { return id.length; });
    let maxLength = Math.max.apply(Math, taskLengths);

    for (let key in taskInfo) {
      let entry = taskInfo[key];
      let paddingLength = maxLength;
      let str = new Array(paddingLength+2).join(' ');
      let descriptionLine = util.format('Runs the %s task.', key);
      if (entry.description) descriptionLine = mapDescription(str, entry.description);
      lines.push(' ' + pad(entry.name, maxLength) + paddingStr + descriptionLine.join('\n').trim());
      lines.push('');
    }

    lines.forEach((line) => console.log(line));

    /**
     * Maps the given array of comment lines by prepending whitespace if
     * necessary.
     * @method mapDescription
     * @param {string} str
     * @param {string[]} lines
     * @return {string[]}
     * @private
     */

    function mapDescription(str, lines) {
      if (typeof lines === 'string') lines = [lines];
      return lines.map(function (line, index) {
        line = line.trim();
        return index ? str + paddingStr + line : line;
      });
    }
  });

};
