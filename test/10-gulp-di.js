'use strict';
const Stream = require('stream');
const path = require('path');

describe('GulpDI', () => {
  const PI = Math.PI;
  const RAD_TO_DEG = 180 / PI;
  const INSTANCE_OPTIONS = { parentDir: basePath() };

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

  let gulp = null;
  let di = null;

  describe('Initialization', () => {
    beforeEach(() => {
      gulp = getGulpInstance();
      di = null;
    });

    it('initializes', () => {
      di = getDiInstance(gulp).resolve();
    });

    it('throws an error without gulp as first argument', () => {
      assert.throws(() => getDiInstance());
    });

    it('byId throws an error when a dependency was not found', () => {
      assert.throws(getDiInstance(gulp).byId);
    });

    it('byId with noError does not throw an error when a dependency was not found', () => {
      di = getDiInstance(gulp).resolve();
      let info = di.byId('UnknownDependency_', true);
      assert.equal(info, null);
    });

    it('byId throws an error when a undesolved dependency was requested', () => {
      assert.throws(() => {
        di = getDiInstance(gulp, INSTANCE_OPTIONS)
          .module('PI', './contrib/examples/pi')
          .byId('PI');
      });
    });

    it('provide', () => {
      di = getDiInstance(gulp)
        .provide('test', 'test')
        .resolve();
      assert.equal(di.byId('test'), 'test');
    });

    it('options.noModules', () => {
      di = getDiInstance(gulp, { noModules: true }).resolve();
      assert.throws(() => di.byId('_'));
      assert.throws(() => di.byId('chalk'));
      assert.throws(() => di.byId('gutil'));
      assert.throws(() => di.byId('log'));
    });

    it('options.noBuiltin', () => {
      di = getDiInstance(gulp, { noBuiltin: true }).resolve();
      assert.throws(() => di.byId('basePath'));
      assert.throws(() => di.byId('Package'));
    });

    it('options.noHelp', () => {
      di = getDiInstance(gulp, { noHelp: true }).resolve();
      assert.ok(!hasTask(gulp, 'help'));
    });
  });

  describe('Dependency injection', () => {
    it('throws an error when using invalid notation', () => {
      di = getDiInstance(gulp);
      assert.throws(() => {
        di.task();
      });
      assert.throws(() => {
        di.module('test', null);
      });
      assert.throws(() => {
        di.task('null');
      });
      assert.throws(() => {
        di.module('test', 0);
      });
    });

    it('module', () => {
      di = getDiInstance(gulp)
        .provide('PI', PI)
        .provide('RAD_TO_DEG', RAD_TO_DEG)
        .module('toDeg', toDegModule);

      di.resolve();

      let toDeg = di.byId('toDeg');
      let pi = di.byId('PI');
      assert.ok(toDeg);
      assert.equal(typeof toDeg, 'function');
      assert.equal(typeof pi, 'number');

      assert.equal(toDeg(pi), 180);
      assert.equal(toDeg(2 * pi), 360);
    });

    it('module with relative and absolute paths', () => {
      di = getDiInstance(gulp, INSTANCE_OPTIONS)
        .module('PI', './contrib/examples/pi')
        .module('DEG_TO_RAD', './contrib/examples/deg-to-rad')
        .module('RAD_TO_DEG', './contrib/examples/rad-to-deg')
        .module('toDeg', './contrib/examples/to-deg')
        .module('toRad', path.join(__dirname, '..', 'contrib/examples/to-rad'));

      di.resolve();

      let toDeg = di.byId('toDeg');
      let toRad = di.byId('toRad');
      let pi = di.byId('PI');
      assert.equal(typeof toDeg, 'function');
      assert.equal(typeof toRad, 'function');

      assert.equal(toDeg(pi), 180);
      assert.equal(toDeg(2 * pi), 360);
      assert.equal(toRad(180), pi);
      assert.equal(toRad(360), 2 * pi);
    });

    it('module throws an error with invalid paths', () => {
      assert.throws(() => {
        di = getDiInstance(gulp)
          .module('PI', './throws/an/error');
      });
    });

    it('modules', (done) => {
      di = getDiInstance(gulp, INSTANCE_OPTIONS)
        .modules('./modules')
        .resolve();
      let paths = di.byId('paths');
      assert.equal(typeof paths, 'object');
      done();
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
        assert.equal(toDeg(2 * PI), 360);
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
        return toDeg(2 * PI);
      }, true);
      assert.equal(injectCalled, 1);
      assert.equal(returnValue, 360);
    });

    it('throws an error when a missing dependency is declared', () => {
      di = getDiInstance(gulp)
        .task(function (test) {});
      assert.throws(() => di.resolve());
    });
  });

  describe('Tasks', () => {
    it('task', (done) => {
      di = getDiInstance(gulp)
        .provide('PI', PI)
        .provide('RAD_TO_DEG', RAD_TO_DEG)
        .module('toDeg', toDegModule)
        .provide('test', 'test')
        .task((test, toDeg, PI) => {
          assert.equal(test, 'test');
          assert.equal(toDeg(PI), 180);
          assert.equal(toDeg(2 * PI), 360);

          done();
        })
        .resolve();
    });

    it('task with an object', (done) => {
      di = getDiInstance(gulp)
        .task({
          'first': () => {
            done();
          }
        })
        .resolve();
    });

    it('tasks', (done) => {
      di = getDiInstance(gulp, INSTANCE_OPTIONS)
        .modules('./modules')
        .tasks('./tasks')
        .resolve();
      di.inject((gulp) => {
        assert.ok(hasTask(gulp, 'semistandard'), 'has "semistandard" task');
        done();
      });
    });

    it('includes gulp and can run a task', (done) => {
      let taskCalled = false;

      di = getDiInstance(gulp)
        .task((gulp, PI, toDeg) => {
          assert.ok(gulp);

          gulp.task('default', (cb) => {
            taskCalled = true;
            assert.equal(toDeg(2 * PI), 360);
            cb();
          });
        })
        .module('toDeg', toDegModule)
        .provide('PI', PI)
        .provide('RAD_TO_DEG', RAD_TO_DEG)
        .resolve();

      gulp.series('default', (cb) => {
        assert.equal(taskCalled, true);
        cb();
        done();
      })();
    });

    it('can concatenate all spec files', (done) => {
      let di = getDiInstance(gulp, { parentDir: basePath(), lazy: false });
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
          return gulp.src('test/**/*.js')
            .pipe(concat('all_specs.js'))
            .pipe(s);
        // console.log('The concat command', concat)
        });
      });
      di.resolve();
      gulp.series('concat', (cb) => {
        assert.ok(ended, 'Stream was closed');
        assert.ok(l > 0, 'Read more than zero bytes');
        assert.equal(count, 1, 'Solely one file written');
        cb();
        done();
      })();
    });
  });
});
