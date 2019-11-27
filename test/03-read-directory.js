'use strict';

describe('readDirectory', () => {
  const readDirectory = require('../lib/read-directory');
  const path = require('path');

  it('reads examples', () => {
    let list = readDirectory(path.join(__dirname, '..', 'contrib/examples'));
    assert.equal(typeof list, 'object');
    let keys = Object.keys(list);
    assert.deepEqual(keys, [
      'deg-to-rad',
      'pi',
      'rad-to-deg',
      'to-deg',
      'to-rad'
    ]);
  });

  it('applies options', () => {
    const toCamelCase = (str) => {
      return str.replace(/[_-][a-z]/ig, function (s) {
          return s.substring(1).toUpperCase();
      });
    };

    let list = readDirectory(path.join(__dirname, '..', 'contrib/examples'), {
      mapKey: (value, key) => toCamelCase(key)
    });
    assert.equal(typeof list, 'object');
    let keys = Object.keys(list);
    assert.deepEqual(keys, [
      'degToRad',
      'pi',
      'radToDeg',
      'toDeg',
      'toRad'
    ]);
  });
});
