'use strict';

describe('parseArgument', function () {

  const $parseArg = require('../lib/parse-argument');

  let concatTask = (gulp, concat) => {
    gulp.task('concat', () => {
      return gulp
      .src('src/**/*.txt')
      .pipe(gulp.dest('docs'));
    });
  };

  it('parses the function notation', () => {
    let info = $parseArg(concatTask);
    assert.deepEqual(info.params, ['gulp', 'concat']);
    assert.equal(info.fn.toString(), concatTask.toString());
  });

  it('parses the minification-safe notation', () => {
    let info = $parseArg(['gulp','concat',concatTask]);
    assert.deepEqual(info.params, ['gulp', 'concat']);
    assert.equal(info.fn.toString(), concatTask.toString());
  });

  it ('parses a function without any arguments', () => {
    let fn = function () {
      console.log(new Date()+'');
    };
    let info = $parseArg(fn);
    assert.deepEqual(info.params, []);
    assert.equal(info.fn.toString(), fn.toString());
  });

  it ('parses a function without any arguments (minification-safe notation)', () => {
    let info = $parseArg([function () {

    }]);
    assert.deepEqual(info.params, []);
    assert.equal(typeof info.fn, 'function');
  });

  it ('throws an error when no valid function was declared', () => {
    let tests = [
      '',
      0,
      1,
      null,
      void 0,
      {},
      ['test'],
      [null, function () {}],
      [0],
      ['   ', function () {}],
      [' ', function () {}],
      ['', function () {}],
    ];
    tests.forEach((test) => assert.throws(() => {
      let info = $parseArg(test);
    }));
  });

  it ('can be used with functions and dependencies', () => {
    let dependencies = {
      A : 'a',
      B : 'b',
      C : 'c'
    };

    let abc = ['A', 'B', 'C', (A, B, C) => `${A}${B}${C}`];

    // Solely changing the order in the minification-safe dependency notation
    let cab0 = ['C', 'A', 'B', (A, B, C) => `${A}${B}${C}`];

    // Using function parameters
    let cab1 = (C, A, B) => `${C}${A}${B}`;

    let getDependencies = (params) => params.map((key) => dependencies[key]);

    let check = (arg, expected) => {
      let info = $parseArg(arg);
      let args = getDependencies(info.params);
      assert.equal(expected, info.fn.apply(null, args));
    };

    check(abc, 'abc');
    check(cab0, 'cab');
    check(cab1, 'cab');

  });

});
