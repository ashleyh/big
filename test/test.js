var assert = require('assert'),
    big = require('../big.js');

function random(limbCount) {
  var limbs = new Uint32Array(limbCount);
  for (var i = 0; i < limbCount; i++) {
    limbs[i] = 0xffffffff * Math.random();
  }
  return new big.Unsigned(limbs);
}

function assertLimbs(n, limbs) {
  assert.equal(n.limbs.length, limbs.length);
  for (var i = 0; i < n.limbs.length; i++) {
    assert.equal(n.limbs[i], limbs[i]);
  }
}

function repeat(s, n) {
  var result = '';
  for (var i = 0; i < n; i++) {
    result += s;
  }
  return result;
}

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

  it('should add numbers without carry', function() {
    var n = big.Unsigned.fromHexString('1');
    assert.equal(n.add(n).toHexString(), '2');
  });

  it('should add numbers with carry', function() {
    var n = big.Unsigned.fromHexString('ffffffffffffffff');
    assert.equal(n.add(n).toHexString(), '1fffffffffffffffe');
  });

  it('should compute limbwise not', function() {
    var n = big.Unsigned.fromHexString('f0f0f0f0f0f0f0f0');
    assert.equal(n.not().toHexString(), 'f0f0f0f0f0f0f0f');
  });

  it('should subtract', function() {
    var a = big.Unsigned.fromHexString('1000000000000000000'),
        b = big.Unsigned.fromHexString('1');
    assert.equal(a.sub(b).toHexString(), 'ffffffffffffffffff');
  });

  it('should obey expected relationship between add and sub', function() {
    for (var i = 1; i < 100; i++) {
      for (var j = 0; j < 100; j++) {
        var a = random(i), b = random(j);
        assert.equal(a.add(b).sub(b).toHexString(), a.toHexString());
      }
    }
  });

  it('should reduce wasteful representations', function() {
    var limbs = new Uint32Array([1, 2, 3, 0, 0]),
        n = new big.Unsigned(limbs);
    assertLimbs(n.reduce(), [1, 2, 3]);
  });

  it('should not reduce not-wasteful representations', function() {
    var limbs = new Uint32Array([1]),
        n = new big.Unsigned(limbs);
    assertLimbs(n.reduce(), [1]);
  });

  it('should reduce [0, 0, ...] to [0]', function() {
    var limbs = new Uint32Array([0, 0, 0]),
        n = new big.Unsigned(limbs);
    assertLimbs(n.reduce(), [0]);
  });

  it('should compute powers of two', function() {
    for (var i = 0; i < 100; i++) {
      var n = big.Unsigned.pow2(i * 4);
      assert.equal(n.toHexString(), '1' + repeat('0', i));
    }
  });
});
