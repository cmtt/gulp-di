'use strict';
const pad = require('pad');
const LINE_PADDING = 5;

module.exports = function HelpTask (gulp) {
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
   *   .pipe(gulp.dest('./tmp'))
   * }
   * ````
   *
   * This module needs to be injected before each successive require('gulp')
   * as it overwrites the "gulp.task" function.
   *
   * As such modifications might lead to unexpected behavior, this module is
   * experimental.
   */

  const Package = this.byId('Package', true) || {};
  const chalk = this.byId('chalk', true);
  const log = this.byId('log', true) || console.log.bind(console);

  const parseFn = require('parse-function');
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
    const args = [].slice.apply(arguments);

    if (typeof deps === 'function') {
      fn = arguments[1];
      deps = [];
    }

    let entry = null;

    if (typeof fn === 'function') {
      const info = parseFn(fn.toString());
      entry = { name: id };
      entry.description = `Runs the ${id} task (no description)`;
      const comments = extractComments(info.body, {first: true});
      if (comments.length) {
        const comment = comments[0];
        const lines = comment.raw
          .split(RGX_LF)
          .map(function (line) {
            return line.replace(/( )*(\*|\/+)/g, '');
          });
        entry.description = lines;
        fn.description = lines;
      }
    }
    if (entry) {
      entry.deps = deps;
      if (DEBUG) {
        let line = [`Adding ${chalk.cyan(entry.name)} task`];
        if (deps.length) {
          line.push(` - depending on ${chalk.magenta(deps.join(' '))}`);
        }
        log.apply(chalk, line);
      }
      taskInfo[id] = entry;
    }
    return _task.apply(gulp, args);
  };

  // Registers the "help" task.

  function HelpTask (done) {
    /* Prints an overview over all available Gulp tasks. */

    let lines = [''];
    const paddingStr = new Array(LINE_PADDING).join(' ');

    lines.push(' ' + Package.name + ' ' + Package.version, '');

    if (Package.description && Package.description.length) {
      lines.push(' ' + Package.description, '');
    }

    const taskIds = Object.keys(taskInfo);
    const taskLengths = taskIds.map(function (id) { return id.length; });
    const maxLength = Math.max.apply(Math, taskLengths);
    const keys = Object.keys(taskInfo);
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
      const key = keys[i];
      const entry = taskInfo[key];
      const paddingLength = maxLength;
      const str = new Array(paddingLength + 2).join(' ');
      let descriptionLine = `Runs the ${key} task.`;
      if (entry.description) descriptionLine = mapDescription(str, entry.description);
      lines.push(' ' + pad(entry.name, maxLength) + paddingStr + descriptionLine.join('\n').trim());
      lines.push('');
    }

    lines.forEach((line) => console.log(line));

    done();
    /**
     * Maps the given array of comment lines by prepending whitespace if
     * necessary.
     * @method mapDescription
     * @param {string} str
     * @param {string[]} lines
     * @return {string[]}
     * @private
     */

    function mapDescription (str, lines) {
      if (typeof lines === 'string') lines = [lines];
      return lines.map(function (line, index) {
        line = line.trim();
        return index ? str + paddingStr + line : line;
      });
    }
  }

  HelpTask.description = 'Displays initial help.';
  gulp.task('help', HelpTask);
};
