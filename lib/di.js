'use strict';

/**
 * @module GulpDI
 */

module.exports = (function () {
  const $parseArg = require('./parse-argument');
  const _ = require('lodash');
  const chalk = require('chalk');
  const findup = require('findup-sync');
  const gutil = require('gulp-util');
  const loadPlugins = require('gulp-load-plugins');
  const path = require('path');
  const requireDir = require('require-dir');
  const Resolver = require('./resolver');
  const defaultPatterns = ['gulp-*', 'gulp.*', '!gulp-di'];

  let parentDir = ''; // will contain the relative path to Gulpfile.js (see below)

  /**
   * @method DependencyError
   * @private
   * @param {string} id
   */

  function DependencyError(id) {
    return Error('Unknown dependency: ' + id);
  }

  /**
   * @method $byId
   * @private
   * @param {string} id
   * @param {boolean} noError
   * @returns {*|null} payload
   */

  function $byId (id, noError) {
    let entry = this.resolver.byId(id);
    if (entry === null && noError !== true) {
      throw new DependencyError(id);
    }
    return entry ? entry.payload : null;
  }

  /**
   * @method $injector
   * @private
   * @param {function|Array} arg
   * @return {*}
   */

  function $injector(arg) {
    let info = $parseArg(arg);
    return info.fn.apply(this, info.params.map(this.byId));
  }

  /**
   * @method $module
   * @param {string} key
   * @param {function} fn
   * @param {string} type
   * @chainable
   */

  function $module (key, fn, type) {
    if (typeof key === 'object' && typeof key.length !== 'number') {
      let obj = arguments[0];
      _.each(obj, (fn, key) => this.module(key, fn, type));
      return this;
    }
    let info = $parseArg(fn);
    this.resolver.provide(key, info.params, info.fn, type || 'module');
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
   * @method propertyKeys
   * @param {obj}
   * @returns {string[]}
   */

  function propertyKeys(obj) {
    let ownProperties = Object.getOwnPropertyNames(obj);
    let keys = Object.keys(obj);
    return ownProperties.filter((prop) => keys.indexOf(prop) === -1);
  }

  class GulpDI {

    /**
     * @constructor
     * @param {object} gulp The gulp instance to use
     * @param {object} options options passed to gulp-load-plugins
     */

    constructor (gulp, options) {
      this.byId = $byId.bind(this);
      this.resolver = new Resolver();
      this.tasksCount = 0;
      this.provide('gulp', gulp);
      this.parseOptions(options);
    }

    /**
     * @method parseOptions
     * @param {object} options
     */

    parseOptions (options) {

      // Necessary as function parameters cannot contain dashes.
      options.camelize = true;

      if (typeof options.lazy === 'undefined') {
        options.lazy = true;
      } else {
        options.lazy = !!options.lazy;
      }

      this.options = options;

      // exposed modules

      if (!options.noModules) {
        this.provide({
          '_' : _,
          'chalk' : chalk,
          'gutil' : gutil
        });
      }

      // built-in dependencies

      if (!options.noBuiltin) {
        this.provide({
          'basePath' : path.join.bind(path, parentDir),
          'log' : this.log,
          'Package' : require(options.config)
        });
      }

      if (!options.noHelp) {
        // installs a gulp.task() wrapper and registers the 'help' task
        this.inject(require('../contrib/help'));
      }

      if (!options.noRunningTasks) {
        this.inject(require('../contrib/running-tasks'));
      }

      // Provides all installed Gulp plugins according to package.json
      let plugins = loadPlugins(options);

      // When options.lazy is set, loadPlugins loads the plugin as soon as
      // the property of the returned "plugins" object is directly accessed.

      if (!!options.lazy) {
        let pluginKeys = propertyKeys(plugins);
        for (let i = 0, l = pluginKeys.length; i < l; i++) {
          this.providePlugin(pluginKeys[i], plugins);
        }
      } else {
        this.provide(plugins);
      }
    }

    /**
     * @method inject
     * @param {function|Array} arg
     * @param {Boolean} returnValue
     * @chainable
     */

    inject (arg, returnValue) {
      let retval = $injector.apply(this, arguments);
      return returnValue ? retval : this;
    }

    /**
     * @method _module
     * @param {string} name
     * @param {function} fn
     * @chainable
     */

    module (name, fn) {
      return $module.call(this, name, fn);
    }

    /**
     * @method modules
     * @param {string} directory
     * @chainable
     */

    modules (directory) {
      return $module.call(this, readDirectory(directory, true));
    }

    /**
     * @method provide
     * @param {string} name
     * @param {*} payload
     * @chainable
     */

    provide (name, payload) {
      if (typeof name === 'object') {
        let obj = arguments[0];
        _.each(obj, (payload, name) => this.provide(name, payload));
        return this;
      }
      this.resolver.provide(name, [], payload, 'provide');
      return this;
    }

    /**
     * @method providePlugin
     * @param {string} name
     * @param {*} payload
     * @chainable
     */

    providePlugin (name, plugins) {
      this.resolver.provideObjectNode(name, [], plugins, 'provide');
      return this;
    }

    /**
     * @method resolve
     * @chainable
     */

    resolve () {
      let resolver = this.resolver;
      let queue = resolver.resolve();
      for (let i = 0, l = queue.length; i < l; ++i) {
        let id = queue[i];
        let entry = resolver.byId(id);
        let retval;
        if (!entry) {
          throw new DependencyError(id);
        }
        if (entry.type === 'module' || entry.type === 'task') {
          retval = entry.payload.apply(this, entry.params.map(this.byId));
          if (entry.type === 'module') {
            resolver.put(id, retval);
          }
        }
      }
      return this;
    }

    /**
     * @method task
     * @param {function|Array} fn
     * @chainable
     */

    task (fn) {
      if (typeof fn === 'object') {
        let obj = arguments[0];
        _.each(obj, (fn) => this.task(fn));
        return this;
      }

      this.module(`task_${this.tasksCount++}`, fn, 'task');
      return this;
    }

    /**
     * @method tasks
     * @param {string} directory
     * @chainable
     */

    tasks (directory) {
      return this.task(readDirectory(directory, false));
    }

  }

  /**
   * @method
   * @param {object} gulp
   * @param {object} options
   * @return {GulpDI} [description]
   */

  return function (gulp, options) {
    options = options || {};

    if (typeof options.parentDir === 'string') {
      parentDir = options.parentDir;
    } else {
      // Set "parentDir" to index.js parent's directory name
      parentDir = path.dirname(module.parent.parent.filename);
    }

    options.config = options.config || findup('package.json', { cwd: parentDir });

    // Ensure loadPlugins being called with the default patterns (see above)

    options.pattern = _.chain(options.pattern || [])
                       .concat(defaultPatterns)
                       .uniq()
                       .value();

    // Necessary to get the current `module.parent` and resolve paths correctly
    // @see gulp-load-plugins

    delete require.cache[__filename];
    return new GulpDI(gulp, options);
  };

})();
