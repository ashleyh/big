function isInt32(n: number) {
  return (n & 0xffffffff) == n;
}

function padLeft(s: string) {
  while (s.length < 8) {
    s = '0' + s;
  }
  return s;
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
}
