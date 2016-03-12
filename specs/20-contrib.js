'use strict';

describe('contrib', () => {

  const getPath = require(basePath('contrib', 'get-path'));
  const standardTask = require(basePath('contrib', 'standard-task'));
  const parseFn = require('parse-function');
  const path = require('path');
  const fs = require('fs');
  const basename = path.basename(__filename);

  describe('getPath', () => {

    it('getPath', () => {
      let obj = {
        first : {
          '1' : 1,
          second : {
            '2' : 2,
            third : {
              '3' : 3,
            }
          }
        }
      };
      let array = [0,1,2, { test : 'test' }];
      assert.equal(typeof getPath(obj), 'object');
      assert.equal(typeof getPath(obj, 'first'), 'object');
      assert.equal(getPath(obj, 'first.1'), 1);
      assert.equal(typeof getPath(obj, 'first.second'), 'object');
      assert.equal(getPath(obj, 'first.second.2'), 2);
      assert.equal(typeof getPath(obj, 'first.second.third'), 'object');
      assert.equal(getPath(obj, 'first.second.third.3'), 3);

      assert.equal(getPath(array, '0'), 0);
      assert.equal(getPath(array, 0), 0);
      assert.equal(getPath(array, '1'), 1);
      assert.equal(getPath(array, '2'), 2);
      assert.deepEqual(getPath(array, '3'), { test : 'test'});
      assert.equal(getPath(array, '3.test'), 'test');
    });

  });

  describe('standardTask', () => {

    it('returns a function which injects solely gulp', () => {
      let fn = standardTask('concat', 'templates/**/*.txt', 'public', { pretty : false });
      let info = parseFn(fn);
      assert.equal(info.name, 'concatTask');
      assert.deepEqual(info.args, ['gulp']);
    });

    it('throws an error when initialized without a function', () => {
      let gulp = getGulpInstance();
      let di = getDiInstance(gulp);

      let fn = standardTask('Package', 'templates/**/*.txt', 'public', { pretty : false });
      di.task(fn);
      di.resolve();
      assert.throws(() => {
        gulp.start('Package');
      });
    });

    it('function calls are valid', () => {
      let fn = standardTask('concat', 'templates/**/*.txt', 'public', { pretty : false });
      assert.equal(typeof fn, 'function');
      let fnString = fn + '';
      let filenameIndex = fnString.indexOf(basename);
      let pluginNameIndex = fnString.indexOf('this.byId("concat");');
      assert.ok(~filenameIndex, 'current filename is inside a comment');
      assert.ok(~pluginNameIndex, 'task plugin is retrieved with byId("concat")');
      assert.equal(fnString[filenameIndex + basename.length], ':', 'line number is delimited from filename');
      assert.ok((/\d/).test(fnString[filenameIndex + basename.length + 1]), 'line number is present');
    });

    it('can concatenate all spec files', (done) => {
      let gulp = getGulpInstance();
      let di = getDiInstance(gulp);

      let fn = standardTask('concat', 'specs/**/*.js', 'trash', 'all.js');
      let destPath = basePath('trash', 'all.js');

      di.task(fn);

      gulp.on('stop', () => {
        assert.ok(fs.existsSync(destPath));
        try {
          fs.unlinkSync(destPath);
        } catch (e) {
          console.log(`Could not remove ${destPath}: ${e.message}`);
        }
        done();
      });

      di.resolve();

      gulp.start('concat');
    });

  });

});
