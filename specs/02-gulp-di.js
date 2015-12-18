/*global describe:false, beforeEach:false, it:false, assert:false, basePath:false */

describe('GulpDI', function () {

  var GulpDI = require(basePath('index.js'));
  var gulp = null;
  var di = null;

  /**
   * @method diInstance
   * @param {object} config
   */

  function diInstance (config) {
    config = config || { pattern: [] };
    return new GulpDI(gulp, config);
  }

  /**
   * Module declaration which assembles the "toDeg" function using PI and
   * RAD_TO_DEG
   *
   * @method toDegModule
   * @param {number} PI
   * @param {number} RAD_TO_DEG
   * @return {function}
   */

  function toDegModule (PI, RAD_TO_DEG) {
    return function toDeg (radValue) {
      return radValue * RAD_TO_DEG;
    };
  }

  beforeEach(function () {
    di = null;
    delete require.cache[require.resolve('gulp')];
    gulp = require('gulp');
  });

  it('initializes', function () {
    di = diInstance();
  });

  it('byId throws an error when a dependency was not found', function () {
    assert.throws(diInstance().byId);
  });

  it('provide', function () {
    di = diInstance()
    .provide('test', 'test');
    assert.equal(di.byId('test'), 'test');
  });

  it('task', function (done) {

    /**
     * Task function which depends on the "test" string.
     * @method taskFunction
     * @param {string} test
     */

    function taskFunction (test) {
      assert.equal(test, 'test');
      done();
    }

    di = diInstance()
    .provide('test', 'test')
    .task(taskFunction)
    .resolve();
  });

  it('throws an error when using invalid notation', function () {
    di = diInstance();
    assert.throws(function () {
      di.task();
    });
    assert.throws(function () {
      di.module('test',null);
    });
    assert.throws(function () {
      di.task('null');
    });
    assert.throws(function () {
      di.module('test',0);
    });
  });

  it('module', function () {
    di = diInstance()
    .provide('PI', Math.PI)
    .provide('RAD_TO_DEG', 180 / Math.PI)
    .module('toDeg', toDegModule);

    assert.ok(di.byId('toDeg'));
    assert.equal(typeof di.byId('toDeg'), 'function');
    di.resolve();

    var toDeg = di.byId('toDeg');
    var PI = di.byId('PI');

    assert.equal(toDeg(PI), 180);
    assert.equal(toDeg(2*PI), 360);

  });

  it('includes gulp and can run a task', function (done) {

    di = diInstance()
    .task(function (gulp, PI, toDeg) {
      assert.ok(gulp);
      gulp.task('default', function () {
        assert.equal(toDeg(2*PI), 360);
        done();
      });
    })
    .module('toDeg', toDegModule)
    .provide('PI', Math.PI)
    .provide('RAD_TO_DEG', 180 / Math.PI)
    .resolve();

    gulp.start('default');

  });

  it('help task', function (done) {
    di = diInstance();
    di.task(function () {
      gulp.task('test', ['help'], function () {
        /**
         * This task comment should appear in this test
         * and it might have multiple lines
         */
      });
      gulp.task('oneline-comment', function () {
        // This comment should appear
        // and this shouldn't
      });
    });
    gulp.on('stop', function () {
      done();
    });
    di.resolve();
    gulp.start('help');
  });

});