/*global describe:false, beforeEach:false, it:false, assert:false,
basePath:false, GulpDI:false, getDiInstance:false, getGulpInstance:false */

describe('GulpDI', function () {

  var gulp = null;
  var di = null;

  beforeEach(function () {
    gulp = getGulpInstance();
    di = new GulpDI(gulp, { DEBUG: true, pattern: [], someTestSetting : '1' });
  });

  it('gulp', function (done) {
    di.task(function (Package) {
      gulp.task('default', function () {
        done();
      });
    })
    .resolve();
    setTimeout(function () {
      gulp.start('default');
    }, 1);
  });

  it('Package', function (done) {
    di.task(function (Package) {
      assert.equal(Package.name, 'gulp-di');
      done();
    })
    .resolve();
  });

  it('basePath', function (done) {
    di.task(function (basePath) {
      var Package = require(basePath('package.json'));
      assert.equal(Package.name, 'gulp-di');
      done();
    })
    .resolve();
  });

  it('options', function (done) {
    di.task(function (basePath) {
      assert.equal(typeof this.options, 'object');
      assert.equal(this.options.someTestSetting, '1');
      done();
    })
    .resolve();
  });

});