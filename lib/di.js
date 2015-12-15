module.exports = (function () {

  var path = require('path');
  var findup = require('findup-sync');
  var requireDir = require('require-dir');
  var loadPlugins = require('gulp-load-plugins');
  var parseFn = require('parse-function');
  var Resolver = require('../lib/resolver');
  var parentDir = '';

  /**
   * @method GulpDI
   * @constructor
   * @param {object} gulp The gulp instance to use
   * @param {object} options options passed to gulp-load-plugins
   */

  function GulpDI(gulp, options) {
    if (!(this instanceof GulpDI)) {
      return new GulpDI(gulp, options);
    }

    var self = this;
    options = options || {};

    // Taken from gulp-load-plugins iot load package.json from the right
    // source.

    options.config = options.config || findup('package.json', {cwd: parentDir});
    options.pattern = options.pattern || ['gulp-*', 'gulp.*', '!gulp-di'];
    options.lazy = false;    // Necessary as all plugins must be available now
    options.camelize = true; // Necessary as function parameters cannot contain
                             // dashes

    // Boolean for throwing errors when dependencies were not found
    options.throw = typeof options.throw === 'boolean' ? options.throw : true;

    this.options = options;
    this.resolver = new Resolver();
    this.tasksCount = 0; // currently, all task modules are referenced by id

    // Provides build-in dependencies.

    this.provide('gulp', gulp);
    this.provide('basePath', path.join.bind(path, parentDir));
    this.provide('Package', require(options.config));

    // Installs the gulp.task() wrapper and registeres the "help" task.

    this.inject(require('../contrib/help'));

    // Provides all installed Gulp plugins according to package.json
    this.provide(loadPlugins(options));
  }

  GulpDI.prototype.inject = inject;
  GulpDI.prototype.injectValue = injectValue;
  GulpDI.prototype.provide = provide;
  GulpDI.prototype.resolve = resolve;
  GulpDI.prototype.task = task;
  GulpDI.prototype.tasks = tasks;

  // Taken from gulp-load-plugins

  parentDir = path.dirname(module.parent.filename);

  // Necessary to get the current `module.parent` and resolve paths correctly

  delete require.cache[__filename];

  return GulpDI;

  /**
   * @method provide
   * @param {string} key
   * @param {*} payload
   * @chainable
   */

  function provide (key, payload) {
    if (typeof key === 'object') {
      var obj = arguments[0];
      var ids = Object.keys(obj);
      for (var i = 0, l = ids.length, id = ''; i < l; ++i) {
        id = ids[i];
        this.resolver.provide(id, [], obj[id]);
      }
      return this;
    }
    this.resolver.provide(key, [], payload);
    return this;
  }

  /**
   * @method task
   * @param {function} fn
   * @chainable
   */

  function task (fn) {
    if (typeof fn !== 'function') {
      throw new Error('gulp-di expects a function');
    }
    var info = parseFn(fn);
    var resolver = this.resolver;
    this.resolver.provide(this.tasksCount++, info.arguments, fn);
    return this;
  }

  /**
   * @method tasks
   * @param {string} directory
   * @chainable
   */

  function tasks(directory) {
    var self = this;
    if (!path.isAbsolute(directory)) {
      directory = path.resolve(parentDir, directory);
    }
    var fns = requireDir(directory);
    var taskIds = Object.keys(fns);
    for (var i = 0, l = taskIds.length, fn, taskId; i < l; ++i) {
      taskId = taskIds[i];
      fn = fns[taskId];
      this.task(fn);
    }
    return this;
  }

  /**
   * @method injectValue
   * @param {string} key
   * @param {function} fn
   * @chainable
   */

  function injectValue (key, fn) {
    this.provide(key, $injector.call(this, fn));
    return this;
  }

  /**
   * @method inject
   * @chainable
   */

  function inject (fn) {
    $injector.call(this, fn);
    return this;
  }

  /**
   * @method $injector
   * @param {function} fn
   * @return {*}
   */

  function $injector(fn) {
    var resolver = this.resolver;
    var info = parseFn(fn);
    return fn.apply(this, info.arguments.map(byId.bind(this)));
  }

  /**
   * @method resolve
   * @chainable
   */

  function resolve() {
    var self = this;
    var resolver = this.resolver;
    var queue = resolver.resolve().filter(isNumber);
    var getById = byId.bind(this);
    for (var i = 0, l = queue.length; i < l; ++i) {
      var entry = resolver.byId(queue[i]);
      entry.payload.apply(self, entry.params.map(getById));
    }
    return this;
  }

  /**
   * @method isNumber
   * @param {number} v
   * @returns {boolean}
   * @private
   */

  function isNumber (v) { return typeof v === 'number'; }

  /**
   * @method byId
   * @param {string} depId
   * @returns {*|null} payload
   * @private
   */

  function byId (depId) {
    var entry = this.resolver.byId(depId);
    if (entry === null && this.options.throw) {
      throw new Error('Unknown dependency: ' + depId);
    }
    return entry ? entry.payload : null;
  }

})();
