'use strict';

const parseStack = require('parse-stack');
const _ = require('lodash');
const path = require('path');

/**
 * Generates a default task, assuming you want to pipe "src" through the plugin
 * specified by "name" to "dest". All following parameters are serialized if
 * necessary and passed on to the plugin.
 *
 * @method standardTask
 * @param {string} name
 * @param {string} src
 * @param {string} dest
 * @returns {function}
 */

function standardTask (name, src, dest) {

  let args = _.toArray(arguments).slice(3); // dependencies
  let stack = null;
  let filename = '<unknown>';
  let line = null;

  try {
    throw new Error('');
  } catch (e) {
    stack = parseStack(e);
  }

  if (stack && stack.length > 1) {
    let entry = stack[1];
    filename = path.basename(entry.filepath);
    line = entry.lineNumber;
  }

  // Serialize arguments if necessary

  try {
    args = args.map(JSON.stringify).join(', ');
  } catch (e) {
    console.log(`Could not parse ${args.length} arguments:\n\n${e.stack}`);
    args = [];
  }

  if (!args.length) {
    args = null;
  }

  let fnName = _.camelCase(name);
  let body = `

  /**
   * Generated task function, registers a "${name}" task.
   * @param {object} gulp The current gulp instance
   * @param {function} ${name} The "${name}" gulp plugin
   */

  gulp.task("${name}", () => {
     /**
      * ${name} task, declared at ${filename}${line ? ':' + line  : ''}
      */

    let plugin = this.byId("${name}");

    if (typeof plugin !== "function") {
      throw new Error("plugin '${name}' is not a function");
    }

    return gulp.src("${src}")
    .pipe(plugin(${ args || 'void 0' }))
    .pipe(gulp.dest("${dest}"));
  });
`;
  let taskFn = eval(`function ${fnName}Task (gulp) { ${body} }; ${fnName}Task;`);

  return taskFn;
}

module.exports = standardTask;
