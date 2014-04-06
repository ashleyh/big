var assert = require('assert'),
    big = require('../big.js');

describe('Unsigned', function() {
  it('should convert to/from number', function() {
    var n = 123;
    var b = big.Unsigned.fromNumber(n);
    assert.equal(b.toNumber(), n);
  });

  it('should produce correct hex representation for small numbers', function() {
    var a = new Uint32Array(1);
    a[0] = 0x123;
    var b = new big.Unsigned(a);
    assert.equal(b.toHexString(), '123');
  });

  it('should produce correct hex representation for big numbers', function() {
    var a = new Uint32Array(2);
    a[0] = 0x123;
    a[1] = 0xdef;
    var b = new big.Unsigned(a);
    assert.equal(b.toHexString(), 'def00000123');
  });

  it('should parse hex strings for small numbers', function() {
    var n = big.Unsigned.fromHexString('123');
    assert.equal(n.limbs[0], 0x123);
  });

  it('should parse hex strings for big numbers', function() {
    var n = big.Unsigned.fromHexString('1234567890abcdef1234567890abcdef');
    assert.equal(n.limbs[0], 0x90abcdef);
    assert.equal(n.limbs[1], 0x12345678);
    assert.equal(n.limbs[2], 0x90abcdef);
    assert.equal(n.limbs[3], 0x12345678);
  });
});
