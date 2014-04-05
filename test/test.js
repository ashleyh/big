var assert = require('assert'),
    big = require('../big.js');

describe('Unsigned', function() {
  it('should convert to/from number', function() {
    var n = 123;
    var b = big.Unsigned.fromNumber(n);
    assert.equal(b.toNumber(), n);
  });
});
