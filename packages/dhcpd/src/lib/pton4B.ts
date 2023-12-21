const pton4B = (str: `${number}.${number}.${number}.${number}`) => {
  const [a, b, c, d] = str.split(".", 4).map((x) => parseInt(x));

  const buffer = Buffer.alloc(4);
  buffer.writeUint8(a, 0);
  buffer.writeUint8(b, 1);
  buffer.writeUint8(c, 2);
  buffer.writeUint8(d, 3);

  return buffer;
};

export default pton4B;
