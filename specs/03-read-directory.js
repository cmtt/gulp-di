'use strict';

describe('readDirectory', () => {
  const readDirectory = require('../lib/read-directory');
  const path = require('path');
  it('reads examples', () => {
    let list = readDirectory(path.join(__dirname, '..', 'contrib/examples'));
    console.log(list);
  });

  it('camelize');
});
