function ntop4(buffer: Buffer): `${number}.${number}.${number}.${number}`;
function ntop4(number: number): `${number}.${number}.${number}.${number}`;
function ntop4(n: Buffer | number): `${number}.${number}.${number}.${number}` {
  const buffer = (() => {
    if (Buffer.isBuffer(n)) return n;
    else {
      const b = Buffer.alloc(4);
      b.writeUint32BE(n);
      return b;
    }
  })();

  return [
    buffer.readUint8(0),
    buffer.readUint8(1),
    buffer.readUint8(2),
    buffer.readUint8(3),
  ].join(".") as `${number}.${number}.${number}.${number}`;
}

export default ntop4;
