export type BootpMessage = ReturnType<typeof splitBootpMessage>;
const splitBootpMessage = (buffer: Buffer) => {
  let i = 0;
  return {
    __original: buffer,
    op: buffer.subarray(i, (i += 1)),
    htype: buffer.subarray(i, (i += 1)),
    hlen: buffer.subarray(i, (i += 1)),
    hops: buffer.subarray(i, (i += 1)),
    xid: buffer.subarray(i, (i += 4)),
    secs: buffer.subarray(i, (i += 2)),
    flags: buffer.subarray(i, (i += 2)),
    ciaddr: buffer.subarray(i, (i += 4)),
    yiaddr: buffer.subarray(i, (i += 4)),
    siaddr: buffer.subarray(i, (i += 4)),
    giaddr: buffer.subarray(i, (i += 4)),
    chaddr: buffer.subarray(i, (i += 16)),
    sname: buffer.subarray(i, (i += 64)),
    file: buffer.subarray(i, (i += 128)),
    options: buffer.subarray(i, (i += 312)),
  };
};

export default splitBootpMessage;
