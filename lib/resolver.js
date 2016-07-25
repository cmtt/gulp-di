'use strict';
const _ = require('lodash');

/**
 * @module Resolver
 * @method Resolver
 * @returns {object}
 */

class Resolver {
  constructor () {
    this.resolved = [];
    this.queue = [];
  }

  /**
   * @method byId
   * @param {string} id
   * @private
   */

  byId (id) {
    return _.find(this.queue, (item) => item.key === id) || null;
  }

  /**
   * @method put
   * @param {string} key
   * @param {*} payload
   */

  put (key, payload) {
    let item = this.byId(key);
    if (!item) {
      throw new Error('Dependency ' + key + 'is not defined');
    }
    item.payload = payload;
  }

  /**
   * @method provide
   * @param {string} key
   * @param {string[]} dependencies
   * @param {*} payload
   * @param {string} type
   */

  provide (key, dependencies, payload, type) {
    this.queue.push({ key, dependencies, payload, type });
  }

  /**
   * @method provideObjectNode
   * @param {string} key
   * @param {string[]} dependencies
   * @param {*} obj
   * @param {string} type
   */

  provideObjectNode (key, dependencies, obj, type) {
    let queuedItem = { key, dependencies, type };
    Object.defineProperty(queuedItem, 'payload', {
      get: function () {
        return obj[key];
      }
    });
    this.queue.push(queuedItem);
  }

  /**
   * @method resolve
   * @description Resolves and empties the current queue.
   */

  resolve () {
    let resolved = [];
    let _isResolved = (id) => !!(~this.resolved.indexOf(id) || ~resolved.indexOf(id));

    /**
     * @method _resolve
     * @private
     * @param {object} entry
     * @param {string[]} unresolved
     * @returns {string[]}
     */

    let _resolve = (entry, unresolved) => {
      if (_isResolved(entry.key)) {
        return;
      }

      unresolved.push(entry.key);
      let dependencies = entry.dependencies.slice();

      for (let i = 0, l = dependencies.length; i < l; ++i) {
        let key = dependencies[i];
        if (_isResolved(key)) {
          continue;
        }
        if (~unresolved.indexOf(key)) {
          throw new Error(`Circular: ${entry.key} -> ${key}`);
        }
        let queuedItem = this.byId(key);
        _resolve({ key, dependencies: queuedItem && queuedItem.dependencies || [] }, unresolved);
      }

      unresolved = _.without(unresolved, entry.key);
      resolved.push(entry.key);
    };
    for (let j = 0, k = this.queue.length; j < k; ++j) {
      _resolve(this.queue[j], []);
    }
    this.resolved = this.resolved.concat(resolved);
    return resolved;
  }
}

Object.defineProperty(Resolver.prototype, 'length', {
  get: function () {
    return this.queue.length;
  }
});

module.exports = Resolver;
