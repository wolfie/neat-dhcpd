import dgram from "node:dgram";
import parseOptions from "./parseOptions";
import fs from "fs/promises";

const splitBootpMessage = (buffer: Buffer) => {
  let i = 0;
  return {
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

const swtch = <V, T extends number>(
  value: T,
  options: Record<T, V>,
  errorTopic: string
): V | undefined => {
  const result = options[value];
  if (typeof result === "undefined")
    throw new Error(
      `[${errorTopic}] Could not match ${value} with ${JSON.stringify(options)}`
    );
  return result;
};

type BootpMessage = ReturnType<typeof splitBootpMessage>;

const parseMessage = (bootpMessage: BootpMessage) => {
  const op = swtch(
    bootpMessage.op.readUint8(),
    {
      1: "BOOTREQUEST",
      2: "BOOTREPLY",
    } as const,
    "op"
  );

  const htype = swtch(
    bootpMessage.htype.readUint8(),
    {
      1: "Ethernet (10 Mb)",
      6: "IEEE 802 Networks",
      7: "ARCNET",
      11: "LocalTalk",
      12: "LocalNet (IBM PCNet or SYTEK LocalNET)",
      14: "SMDS",
      15: "Frame Relay",
      16: "Asynchronous Transfer Mode (ATM)",
      17: "HDLC",
      18: "Fibre Channel",
      19: "Asynchronous Transfer Mode (ATM)",
      20: "Serial Line",
    } as const,
    "htype"
  );

  const hlen = bootpMessage.hlen.readUInt8();
  if (hlen !== 6) throw new Error("Unexpected hlen: " + hlen);

  const hops = bootpMessage.hops.readUint8();
  const xid = "0x" + bootpMessage.xid.toString("hex");
  const secs = bootpMessage.secs.readUint16BE();
  const broadcastFlag = !!(bootpMessage.flags.readUInt8() & 0b10000000);

  const ciaddr = [
    bootpMessage.ciaddr.readUint8(0),
    bootpMessage.ciaddr.readUint8(1),
    bootpMessage.ciaddr.readUint8(2),
    bootpMessage.ciaddr.readUint8(3),
  ].join(".");

  const yiaddr = [
    bootpMessage.yiaddr.readUint8(0),
    bootpMessage.yiaddr.readUint8(1),
    bootpMessage.yiaddr.readUint8(2),
    bootpMessage.yiaddr.readUint8(3),
  ].join(".");

  const siaddr = [
    bootpMessage.siaddr.readUint8(0),
    bootpMessage.siaddr.readUint8(1),
    bootpMessage.siaddr.readUint8(2),
    bootpMessage.siaddr.readUint8(3),
  ].join(".");

  const giaddr = [
    bootpMessage.giaddr.readUint8(0),
    bootpMessage.giaddr.readUint8(1),
    bootpMessage.giaddr.readUint8(2),
    bootpMessage.giaddr.readUint8(3),
  ].join(".");

  const chaddr = [
    bootpMessage.chaddr.subarray(0, 1).toString("hex"),
    bootpMessage.chaddr.subarray(1, 2).toString("hex"),
    bootpMessage.chaddr.subarray(2, 3).toString("hex"),
    bootpMessage.chaddr.subarray(3, 4).toString("hex"),
    bootpMessage.chaddr.subarray(4, 5).toString("hex"),
    bootpMessage.chaddr.subarray(5, 6).toString("hex"),
  ].join(":");

  const sname = bootpMessage.sname.toString("hex");
  const file = bootpMessage.file.toString("hex");

  const options = parseOptions(bootpMessage.options);

  return {
    op,
    htype,
    hlen,
    hops,
    xid,
    secs,
    broadcastFlag,
    ciaddr,
    yiaddr,
    siaddr,
    giaddr,
    chaddr,
    sname,
    file,
    options,
  } as const;
};

export const createServer = () => {
  const socket = dgram.createSocket("udp4");
  socket.on("message", (msg, rinfo) => {
    console.log(`got message from ${rinfo.address}.${rinfo.port}`);
    const bootp = splitBootpMessage(msg);
    const dhcp = parseMessage(bootp);
    console.log(JSON.stringify(dhcp));
    fs.writeFile(
      new Date().toISOString().replaceAll(":", "-") + ".json",
      JSON.stringify({ ...dhcp, original: msg.toString("base64") }, null, 2)
    );
  });
  socket.on("listening", () => {
    const { address, port } = socket.address();
    return console.log(`listening on ${address}:${port}`);
  });
  socket.on("close", () => console.log("closed!"));
  socket.bind(67, "0.0.0.0");
};
