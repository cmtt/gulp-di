'use strict';
const Stream = require('stream');

describe('GulpDI', () => {

  let gulp = null;
  let di = null;

  const PI = Math.PI;
  const RAD_TO_DEG = 180 / PI;

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
    return (radValue) => radValue * RAD_TO_DEG;
  }

  beforeEach(() => {
    di = null;
    gulp = getGulpInstance();
  });

  it('initializes', () => {
    di = getDiInstance(gulp);
  });

  it('byId throws an error when a dependency was not found', () => {
    assert.throws(getDiInstance(gulp).byId);
  });

  it('provide', () => {
    di = getDiInstance(gulp)
    .provide('test', 'test');
    assert.equal(di.byId('test'), 'test');
  });

  it('task', (done) => {

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

  it('throws an error when using invalid notation', () => {
    di = getDiInstance(gulp);
    assert.throws(() => {
      di.task();
    });
    assert.throws(() => {
      di.module('test',null);
    });
    assert.throws(() => {
      di.task('null');
    });
    assert.throws(() => {
      di.module('test',0);
    });
  });

  it('module', () => {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule);

    assert.ok(di.byId('toDeg'));
    assert.equal(typeof di.byId('toDeg'), 'function');
    di.resolve();

    let toDeg = di.byId('toDeg');
    let pi = di.byId('PI');

    assert.equal(toDeg(pi), 180);
    assert.equal(toDeg(2*pi), 360);
  });

  it('task', (done) => {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule)
    .task((toDeg, PI) => {
      assert.equal(toDeg(PI), 180);
      assert.equal(toDeg(2*PI), 360);
      done();
    })
    .resolve();
  });

  it('inject (chainable)', (done) => {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule)
    .resolve();
    let injectCalled = 0;
    di.inject((toDeg, PI) => {
      ++injectCalled;
      assert.equal(toDeg(PI), 180);
      assert.equal(toDeg(2*PI), 360);
    })
    .inject(() => {
      assert.equal(injectCalled, 1);
      done();
    });
  });

  it('inject (w/ return value)', () => {
    di = getDiInstance(gulp)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .module('toDeg', toDegModule)
    .resolve();
    let injectCalled = 0;
    let returnValue = di.inject((toDeg, PI) => {
      ++injectCalled;
      return toDeg(2*PI);
    }, true);
    assert.equal(injectCalled, 1);
    assert.equal(returnValue, 360);
  });

  it('includes gulp and can run a task', (done) => {
    gulp.on('stop', () => {
      done();
    });

    di = getDiInstance(gulp)
    .task((gulp, PI, toDeg) => {
      assert.ok(gulp);
      gulp.task('default', () => {
        assert.equal(toDeg(2*PI), 360);
      });
    })
    .module('toDeg', toDegModule)
    .provide('PI', PI)
    .provide('RAD_TO_DEG', RAD_TO_DEG)
    .resolve();

    gulp.start('default');
  });

  it('can concatenate all spec files', (done) => {
    let gulp = getGulpInstance();
    let di = getDiInstance(gulp);
    let s = new Stream.Transform();
    let l = 0;
    let count = 0;
    let ended = false;
    s.write = function (file) {
      ++count;
      l += file._contents.length;
    };
    s.on('end', () => {
      ended = true;
    });

    di.task((gulp, concat) => {
      gulp.task('concat', () => {
        /**
         * This task comment should appear in this test
         * and it might have multiple lines
         */
        return gulp.src('specs/**/*.js')
        .pipe(concat('all_specs.js'))
        .pipe(s);
        // console.log('The concat command', concat);
      });
    });
    gulp.on('stop', () => {
      assert.ok(ended, 'Stream was closed');
      assert.ok(l > 0, 'Read more than zero bytes');
      assert.equal(count, 1, 'Solely one file written');
      done();
    });
    di.resolve();
    gulp.start('concat');
  });
});
