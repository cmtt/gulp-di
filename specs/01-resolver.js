/*global describe:false, beforeEach:false, it:false, assert:false, basePath:false */

describe('Resolver', function () {

  var Resolver = require('../lib/resolver');
  var d = null;

  beforeEach(function () {
    d = new Resolver('test');
  });

  it('initializes, length is zero', function () {
    assert.equal(d.length, 0);
  });

  it('increases its length', function () {
    d.provide('one', ['two', 'three']);
    assert.equal(d.length, 1);
    d.provide('two', ['four']);
    assert.equal(d.length, 2);
  });

  it('resolves in a correct order with functions', function () {
    d.provide('test', ['one', 'two', 'three']);
    d.provide('two', []);
    d.provide('one', []);
    d.provide('three', []);
    assert.deepEqual(d.resolve(), ['one', 'two', 'three', 'test']);
  });

  it('provide, byId', function () {
    d.provide('test',[], 'test', 'string');
    d.provide('one',['test'], 1, 'number');

    var entry = d.byId('test');
    assert.deepEqual(d.byId('test'), {
      key: 'test',
      params: [],
      payload: 'test',
      type: 'string'
    });
    assert.deepEqual(d.byId('one'), {
      key: 'one',
      params: ['test'],
      payload: 1,
      type: 'number'
    });
    assert.deepEqual(d.resolve(), ['test', 'one']);
  });

  it('put throws an error when a value was not provided', function () {
    assert.throws(function () {
      d.put('test', 'test');
    });
  });

  it('put', function () {
    d.provide('test', [], { test : false }, 'object');
    d.resolve();
    assert.deepEqual(d.byId('test'), {
      key: 'test',
      params: [],
      payload: { test : false },
      type: 'object'
    });
    d.put('test', { test : true });
    assert.deepEqual(d.byId('test').payload,{
      test : true
    });
  });

});
