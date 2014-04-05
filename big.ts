function isInt32(n: number) {
  return (n & 0xffffffff) == n;
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
}
