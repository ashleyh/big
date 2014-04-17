function padLeft(s: string) {
  while (s.length < 8) {
    s = '0' + s;
  }
  return s;
}

function addWouldOverflow(a: number, b: number) {
  return a > (0xffffffff - b);
}

export class Unsigned {
  constructor(public limbs: Uint32Array) {
  }

  static fromArray(arr) {
    return new Unsigned(new Uint32Array(arr));
  }

  static fromNumber(n: number) {
    return Unsigned.fromArray([n]);
  }

  static pow2(n: number) {
    return Unsigned.fromNumber(1).shiftUp(n);
  }

  toNumber() {
    if (this.limbs.length == 1) {
      return this.limbs[0];
    }
  }

  static fromHexString(s: string) {
    var arr = [],
        limb: string;
    while (s.length > 8) {
      limb = s.substr(s.length - 8, 8);
      s = s.substr(0, s.length - 8);
      arr.push(parseInt(limb, 16));
    }
    arr.push(parseInt(s, 16));
    return Unsigned.fromArray(arr);
  }

  toHexString() {
    var result = '',
        limb: string;
    for (var i = 0; i < this.limbs.length - 1; i++) {
      limb = this.limbs[i].toString(16);
      result = padLeft(limb) + result;
    }
    limb = this.limbs[this.limbs.length - 1].toString(16);
    result = limb + result;
    return result;
  }

  add(other: Unsigned) {
    var L = this.limbs.length,
        M = other.limbs.length,
        N = (L < M)? (M + 1): (L + 1),
        limbs = new Uint32Array(N),
        carry = 0;
    for (var i = 0; i < N; i++) {
      var a = (i < L)? this.limbs[i]: 0;
      var b = (i < M)? other.limbs[i]: 0;
      limbs[i] = a + b + carry;
      carry = (addWouldOverflow(a, b) || addWouldOverflow(a + b, carry))? 1: 0;
    }
    return (new Unsigned(limbs)).reduce();
  }

  reduce() {
    var N = this.limbs.length - 1;
    while (N > 0 && this.limbs[N] == 0) {
      N--;
    }
    return new Unsigned(this.limbs.subarray(0, N + 1));
  }

  not() {
    var N = this.limbs.length,
        limbs = new Uint32Array(N);
    for (var i = 0; i < N; i++) {
      limbs[i] = ~this.limbs[i];
    }
    return new Unsigned(limbs);
  }

  // assumes other is less than this
  sub(other: Unsigned) {
    return this.not().add(other).not().reduce();
  }

  shiftUp(bits: number) {
    var limbs = [];
    while (bits >= 32) {
      limbs.push(0);
      bits -= 32;
    }
    if (bits == 0) {
      for (var i = 0; i < this.limbs.length; i++) {
        limbs.push(this.limbs[i]);
      }
    } else {
      var carry = 0;
      var loMask = (1 << (32 - bits)) - 1;
      var hiMask = ~loMask;
      for (var i = 0; i < this.limbs.length; i++) {
        var old = this.limbs[i];
        limbs.push(carry | ((old & loMask) << bits));
        carry = (old & hiMask) >>> (32 - bits);
      }
      if (carry != 0) {
        limbs.push(carry);
      }
    }
    return Unsigned.fromArray(limbs);
  }

  mul16(n: number) {
    var limbs1 = [],
        limbs2 = [];

    for (var i = 0; i < this.limbs.length; i++) {
      var limb = this.limbs[i],
          lo = limb & 0xffff,
          hi = limb >>> 16;
      limbs1.push(lo * n);
      limbs2.push(hi * n);
    }

    var a = Unsigned.fromArray(limbs1),
        b = Unsigned.fromArray(limbs2);

    return a.add(b.shiftUp(16));
  }

  mul(other: Unsigned) {
    var accum = Unsigned.fromNumber(0);
    for (var i = 0; i < this.limbs.length; i++) {
      var limb = this.limbs[i],
          lo = limb & 0xffff,
          hi = limb >>> 16;
      accum = accum.add(other.mul16(lo).shiftUp(32 * i));
      accum = accum.add(other.mul16(hi).shiftUp(32 * i + 16));
    }
    return accum;
  }
}
