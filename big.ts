function isInt32(n: number) {
  return (n & 0xffffffff) == n;
}

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

  static fromNumber(n: number) {
    if (isInt32(n)) {
      var arr = new Uint32Array(1);
      arr[0] = n;
      return new Unsigned(arr);
    }
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
    var limbs = new Uint32Array(arr);
    return new Unsigned(limbs);
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
}
