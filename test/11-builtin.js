'use strict';

describe('Built-in', () => {
  let gulp = null;
  let di = null;

  beforeEach(() => {
    gulp = getGulpInstance();
    di = getDiInstance(gulp, { DEBUG: false, pattern: [], someTestSetting: '1', parentDir: basePath() });
  });

  it('gulp', (done) => {
    di.task((Package) => {
      gulp.task('default', () => {
        done();
      });
    })
      .resolve();
    setTimeout(() => {
      gulp.start('default');
    }, 1);
  });

  it('Package', (done) => {
    di.task((Package) => {
      assert.equal(Package.name, 'gulp-di');
      done();
    })
      .resolve();
  });

  it('basePath', (done) => {
    di.task((basePath) => {
      let Package = require(basePath('package.json'));
      assert.equal(Package.name, 'gulp-di');
      done();
    })
      .resolve();
  });

  it('options', (done) => {
    di.task(function (basePath) {
      assert.equal(typeof this.options, 'object');
      assert.equal(this.options.someTestSetting, '1');
      done();
    })
      .resolve();
  });
});
