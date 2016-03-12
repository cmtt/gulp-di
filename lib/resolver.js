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
    this.queue.push({
      key : key,
      params : dependencies,
      payload : payload,
      type : type
    });
  }

  /**
   * @method provideObjectNode
   * @param {string} key
   * @param {string[]} dependencies
   * @param {*} obj
   * @param {string} type
   */

  provideObjectNode (key, dependencies, obj, type) {
    let queuedItem = {
      key : key,
      params : dependencies,
      type : type
    };
    Object.defineProperty(queuedItem, 'payload', {
      get : function () {
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

      let params = entry.params.slice();

      for (let i = 0, l = params.length; i < l; ++i) {
        let dep = params[i];
        if (_isResolved(dep)) {
          continue;
        }
        if (~unresolved.indexOf(dep)) {
          throw new Error('Circular: '  + entry.key + ' -> ' + dep);
        }
        let queuedItem = this.byId(dep);
        _resolve({
          key : dep,
          params : queuedItem && queuedItem.params || []
        }, unresolved);
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
  get : function () {
    return this.queue.length;
  }
});

module.exports = Resolver;
