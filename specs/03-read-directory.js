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

  it('camelize', () => {
    let list = readDirectory(path.join(__dirname, '..', 'contrib/examples'), true);
    assert.equal(typeof list, 'object');
    let keys = Object.keys(list);
    assert.deepEqual(keys, [
      'deg-to-rad',
      'pi',
      'rad-to-deg',
      'to-deg',
      'to-rad',
      'degToRad',
      'radToDeg',
      'toDeg',
      'toRad'
    ]);
  });
});
