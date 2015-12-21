/*global describe:false, beforeEach:false, it:false, assert:false,
basePath:false, GulpDI:false, getDiInstance:false, getGulpInstance:false */
describe('GulpDI', function () {

  var GulpDI = require(basePath('index.js'));
  var gulp = null;
  var di = null;

  var PI = Math.PI;
  var RAD_TO_DEG = 180 / PI;

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
    return function toDeg (radValue) { return radValue * RAD_TO_DEG; };
  }

  beforeEach(function () {
    di = null;
    gulp = getGulpInstance();
  });

  it('initializes', function () {
    di = getDiInstance(gulp);
  });

  it('byId throws an error when a dependency was not found', function () {
    assert.throws(getDiInstance(gulp).byId);
  });

  it('provide', function () {
    di = getDiInstance(gulp)
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

    di = getDiInstance(gulp)
    .provide('test', 'test')
    .task(taskFunction)
    .resolve();
  });

  it('throws an error when using invalid notation', function () {
    di = getDiInstance(gulp);
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
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule);

    assert.ok(di.byId('toDeg'));
    assert.equal(typeof di.byId('toDeg'), 'function');
    di.resolve();

    var toDeg = di.byId('toDeg');
    var pi = di.byId('PI');

    assert.equal(toDeg(pi), 180);
    assert.equal(toDeg(2*pi), 360);

  });

  it('task', function (done) {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule)
    .task(function (toDeg, PI) {
      assert.equal(toDeg(PI), 180);
      assert.equal(toDeg(2*PI), 360);
      done();
    })
    .resolve();
  });

  it('inject (chainable)', function (done) {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule)
    .resolve();
    var injectCalled = 0;
    di.inject(function (toDeg, PI) {
      ++injectCalled;
      assert.equal(toDeg(PI), 180);
      assert.equal(toDeg(2*PI), 360);
    })
    .inject(function () {
      assert.equal(injectCalled, 1);
      done();
    });
  });

  it('inject (w/ return value)', function () {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule)
    .resolve();
    var injectCalled = 0;
    var returnValue = di.inject(function (toDeg, PI) {
      ++injectCalled;
      return toDeg(2*PI);
    }, true);
    assert.equal(injectCalled, 1);
    assert.equal(returnValue, 360);
  });

  it('includes gulp and can run a task', function (done) {

    di = getDiInstance(gulp)
    .task(function (gulp, PI, toDeg) {
      assert.ok(gulp);
      gulp.task('default', function () {
        assert.equal(toDeg(2*PI), 360);
        done();
      });
    })
    .module('toDeg', toDegModule)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .resolve();

    gulp.start('default');

  });

  it('help task', function (done) {
    di = getDiInstance(gulp);
    di.task(function () {
      gulp.task('test', ['help'], function () {
        /**
         * This task comment should appear in this test
         * and it might have multiple lines
         */
      });
      gulp.task('oneline-comment', function () {
        // This comment line should appear
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