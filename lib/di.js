/*jshint -W089 */
module.exports = (function () {
  var gutil = require('gulp-util');
  var chalk = require('chalk');
  var findup = require('findup-sync');
  var loadPlugins = require('gulp-load-plugins');
  var parseFn = require('parse-function');
  var path = require('path');
  var requireDir = require('require-dir');

  var Resolver = require('./resolver');

  var parentDir = '';

  /**
   * @method GulpDI
   * @constructor
   * @param {object} gulp The gulp instance to use
   * @param {object} options options passed to gulp-load-plugins
   */

  function GulpDI(gulp, options) {
    options = options || {};

    if (!(this instanceof GulpDI)) {
      return new GulpDI(gulp, options);
    }

    var self = this;

    options.config = options.config || findup('package.json', {cwd: parentDir});
    options.pattern = options.pattern || ['gulp-*', 'gulp.*', '!gulp-di'];
    options.lazy = false;    // Necessary as all plugins must be available now
    options.camelize = true; // Necessary as function parameters cannot contain
                             // dashes.

    this.options = options;
    this.tasksCount = 0;
    this.byId = $byId.bind(this);
    this.log = gutil.log.bind(gutil);
    this.resolver = new Resolver();

    // built-in dependencies
    this.provide({
      'gulp' : gulp,
      'chalk' : chalk,
      'log' : this.log,
      'basePath' : path.join.bind(path, parentDir),
      'Package' : require(options.config)
    });

    if (!options.noHelp) {
      // installs a gulp.task() wrapper and registeres the 'help' task
      this.inject(require('../contrib/help'));
    }

    // Provides all installed Gulp plugins according to package.json
    this.provide(loadPlugins(options));
  }

  GulpDI.prototype.inject = inject;
  GulpDI.prototype.module = _module;
  GulpDI.prototype.modules = modules;
  GulpDI.prototype.provide = provide;
  GulpDI.prototype.resolve = resolve;
  GulpDI.prototype.task = task;
  GulpDI.prototype.tasks = tasks;

  // Set "parentDir" to index.js parent's directory name

  parentDir = path.dirname(module.parent.parent.filename);

  // Necessary to get the current `module.parent` and resolve paths correctly
  // @see gulp-load-plugins

  delete require.cache[__filename];

  return GulpDI;

  /**
   * @method provide
   * @param {string} name
   * @param {*} payload
   * @chainable
   */

  function provide (name, payload) {
    if (typeof name === 'object') {
      var obj = arguments[0];
      for (name in obj) {
        this.provide(name, obj[name]);
      }
      return this;
    }
    this.resolver.provide(name, [], payload, 'provide');
    return this;
  }

  /**
   * @method task
   * @param {function|Array} fn
   * @chainable
   */

  function task (fn) {
    if (typeof fn === 'object') {
      var obj = arguments[0];
      for (var name in obj) {
        this.task(obj[name]);
      }
      return this;
    }

    this.module('task_' + this.tasksCount++, fn, 'task');
    return this;
  }

  /**
   * @method readDirectory
   * @param {string} directory
   * @param {Boolean} camelcase
   * @return {object}
   */

  function readDirectory (directory, camelcase) {
    if (!path.isAbsolute(directory)) {
      directory = path.resolve(parentDir, directory);
    }
    return requireDir(directory, {camelcase : !!camelcase});
  }

  /**
   * @method tasks
   * @param {string} directory
   * @chainable
   */

  function tasks(directory) {
    this.task(readDirectory(directory, false));
    return this;
  }

  /**
   * @method modules
   * @param {string} directory
   * @chainable
   */

  function modules(directory) {
    return $module.call(this, readDirectory(directory, true));
  }

  /**
   * @method _module
   * @param {string} name
   * @param {function} fn
   * @chainable
   */

  function _module(name, fn) { return $module.call(this, name, fn); }

  /**
   * @method $module
   * @param {string} key
   * @param {function} fn
   * @param {string} type
   * @chainable
   */

  function $module (key, fn, type) {
    if (typeof key === 'object' && typeof key.length !== 'number') {
      var obj = arguments[0];
      for (key in obj) {
        this.module(key, obj[key], type);
      }
      return this;
    }
    var info = $parseArg(fn);
    this.resolver.provide(key, info.params, info.fn, type || 'module');
    return this;
  }

  /**
   * @method inject
   * @param {function|Array} arg
   * @param {Boolean} returnValue
   * @chainable
   */

  function inject(arg, returnValue) {
    var retval = $injector.apply(this, arguments);
    return returnValue ? retval : this;
  }

  /**
   * @method resolve
   * @chainable
   */

  function resolve() {
    var self = this;
    var resolver = this.resolver;
    var queue = resolver.resolve();
    for (var i = 0, l = queue.length; i < l; ++i) {
      var id = queue[i];
      var entry = resolver.byId(id);
      var retval;
      if (!entry) {
        throw new DependencyError(id);
      }
      if (entry.type === 'module' || entry.type === 'task') {
        retval = entry.payload.apply(self, entry.params.map(this.byId));
        if (entry.type === 'module') { resolver.put(id, retval); }
      }
    }
    return this;
  }

  /**
   * @method DependencyError
   * @private
   * @param {string} id
   */

  function DependencyError(id) {
    return Error('Unknown dependency: ' + id);
  }

  /**
   * @method $injector
   * @private
   * @param {function|Array} arg
   * @return {*}
   */

  function $injector(arg) {
    var info = $parseArg(arg);
    return info.fn.apply(this, info.params.map(this.byId));
  }

  /**
   * Parses the given dependency injection notation, either using a function
   * with dependencies as its parameters or using the minification-safe with an
   * array.
   * @method $parseArg
   * @private
   * @param {function|Array} arg
   * @return {object}
   */

  function $parseArg(arg) {
    var params = [];
    var fn = null;

    // ['dependency', function (dependency) {}]

    if (typeof arg === 'object' && typeof arg.length === 'number') {
      var l = arg.length;
      params = arg.slice(0, l -1);
      fn = arg[l-1];
      if (typeof fn !== 'function') {
        throw new Error('Function expected');
      }

    // function (dependency) {}

    } else if (typeof arg === 'function') {
      var info = parseFn(arg);
      params = info.arguments.slice();
      fn = arg;
    } else {
      throw new SyntaxError('Invalid dependency injection notation');
    }
    return {
      fn : fn,
      params : params
    };
  }

  /**
   * @method $byId
   * @private
   * @param {string} id
   * @returns {*|null} payload
   */

  function $byId (id) {
    var entry = this.resolver.byId(id);
    if (entry === null) {
      throw new DependencyError(id);
    }
    return entry ? entry.payload : null;
  }

})();
