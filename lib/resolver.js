/**
 * @method Resolver
 * @returns {object}
 */

function Resolver() {
  var queue = [];

  /**
   * @method getById
   * @param {string} id
   * @private
   */

  function getById (id) {
    for (var i = 0, l = queue.length; i < l; ++i) {
      var item = queue[i];
      if (item.key === id) return item;
    }
    return null;
  }

  /**
   * @method resolve
   * @description Resolves and empties the current queue.
   */

  function resolve() {
    var resolved = [];

    /**
     * @method _resolve
     * @private
     */

    function _resolve(entry, unresolved) {
      if (resolved.indexOf(entry.key) !== -1) return;
      unresolved.push(entry.key);
      var params = entry.params.slice();
      for (var i = 0, l = params.length; i < l; ++i) {
        var dep = params[i];
        if (~resolved.indexOf(dep)) continue;
        if (~unresolved.indexOf(dep)) throw new Error('Circular: '  + entry.key + ' -> ' + dep);
        var queuedItem = getById(dep);
        _resolve({
          key : dep,
          params : queuedItem && queuedItem.params || []
        }, unresolved);
      }

      var index = unresolved.indexOf(entry.key);
      if (~index) unresolved.splice(index, 1);
      resolved.push(entry.key);
    }

    for (var j = 0, k = queue.length; j < k; ++j) _resolve(queue[j], []);
    return resolved;
  }

  /**
   * @method put
   * @param {string} key
   * @param {*} payload
   */

  function put(key, payload) {
    var item = this.byId(key);
    if (!item) throw new Error('Dependency ' + key + 'is not defined');
    item.payload = payload;
  }

  /**
   * @method provide
   * @param {string} key
   * @param {string[]} dependencies
   * @param {string} type
   * @param {*} payload
   */

  function provide(key, dependencies, payload, type) {
    queue.push({
      key : key,
      params : dependencies,
      payload : payload,
      type : type
    });
  }

  return {
    byId : getById,
    get length() { return queue.length; },
    put : put,
    provide : provide,
    resolve : resolve
  };
}

module.exports = Resolver;
