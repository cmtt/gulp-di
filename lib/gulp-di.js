'use strict';

module.exports = (function () {
  const $parseArg = require('./parse-argument');
  const _ = require('lodash');
  const chalk = require('chalk');
  const findup = require('findup-sync');
  const gutil = require('gulp-util');
  const loadPlugins = require('gulp-load-plugins');
  const path = require('path');
  const Resolver = require('./resolver');
  const defaultPatterns = ['gulp-*', 'gulp.*', '!gulp-di'];
  const readDirectory = require('./read-directory');
  const DependencyError = require('./dependency-error');
  const normalizePath = require('./normalize-path');

  let parentDir = '';

  /**
   * @module GulpDI
   */

  class GulpDI {

    /**
     * @constructor
     * @param {object} gulp The gulp instance to use
     * @param {object} options options passed to gulp-load-plugins
     */

    constructor (gulp, options) {
      if (typeof gulp === 'undefined' || !gulp) {
        throw new Error('A gulp instance must be provided as first argument');
      }
      this.byId = this.byId.bind(this);
      this.resolver = new Resolver();
      this.tasksCount = 0;

      this.provide('gulp', gulp);
      this.parseOptions(options);
    }

    /**
     * @method $byId
     * @param {string} id
     * @param {boolean} noError
     * @returns {*|null} payload
     */

    byId (id, noError) {
      const entry = this.resolver.byId(id);
      const isResolved = this.resolver.resolved.indexOf(id) !== -1;
      if (noError !== true) {
        if (entry === null) {
          throw new DependencyError(id);
        }
        if (!isResolved) {
          throw new Error(`Attempted to access unresolved dependency "${id}"`);
        }
      }
      return entry ? entry.payload : null;
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
          '_': _,
          'chalk': chalk,
          'gutil': gutil,
          'log': gutil.log.bind(gutil)
        });
      }

      // built-in dependencies

      if (!options.noBuiltin) {
        this.provide({
          'basePath': path.join.bind(path, parentDir),
          'Package': require(options.config)
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
      const plugins = loadPlugins(options);

      // When options.lazy is set, loadPlugins loads the plugin as soon as
      // the property of the returned "plugins" object is directly accessed.

      if (options.lazy) {
        const pluginKeys = _.keys(plugins);
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
      const info = $parseArg(arg);
      const retval = info.fn.apply(this, info.params.map((param) => this.byId(param, true)));
      return returnValue ? retval : this;
    }

    /**
     * @method _module
     * @param {string} name
     * @param {function} fn
     * @param {string} type
     * @chainable
     */

    module (name, fn, type) {
      if (typeof fn === 'string') {
        try {
          fn = require(normalizePath(parentDir, fn));
        } catch (e) {
          throw new Error(`Could not load module "${name}" from "${fn}"`);
        }
      }
      if (typeof name === 'object' && typeof name.length !== 'number') {
        const obj = arguments[0];
        _.each(obj, (fn, key) => this.module(key, fn, type));
        return this;
      }
      const info = $parseArg(fn);
      this.resolver.provide(name, info.params, info.fn, type || 'module');
      return this;
    }

    /**
     * @method modules
     * @param {string} directory
     * @chainable
     */

    modules (directory) {
      return this.module(readDirectory(normalizePath(parentDir, directory), true));
    }

    /**
     * @method provide
     * @param {string} name
     * @param {*} payload
     * @chainable
     */

    provide (name, payload) {
      if (typeof name === 'object') {
        const obj = arguments[0];
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
      const resolver = this.resolver;
      const queue = resolver.resolve();
      for (let i = 0, l = queue.length; i < l; ++i) {
        const id = queue[i];
        const entry = resolver.byId(id);
        let retval = null;
        if (!entry) {
          throw new DependencyError(id);
        }
        if (entry.type === 'module' || entry.type === 'task') {
          retval = entry.payload.apply(this, entry.dependencies.map(this.byId));
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
        const obj = arguments[0];
        let keys = Object.keys(obj).sort();
        const defaultIndex = keys.indexOf('default');
        if (~defaultIndex) {
          keys.splice(defaultIndex, 1);
          keys.push('default');
        }
        keys.forEach((name) => this.task(obj[name]));
        return this;
      }
      if (typeof fn === 'string') {
        try {
          fn = require(normalizePath(parentDir, fn));
        } catch (e) {
          throw new Error(`Could not load task from "${fn}"`);
        }
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
      return this.task(readDirectory(normalizePath(parentDir, directory), false));
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
