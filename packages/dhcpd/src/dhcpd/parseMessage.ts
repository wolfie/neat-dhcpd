import parseOptions from "./parseOptions";
import ntop4 from "../lib/ntop4";
import type { BootpMessage } from "./splitBootpMessage";
import { htypeForNumber, opForNumber } from "./numberStrings";

export type DhcpMessage = ReturnType<typeof parseMessage>;

export const parseMessage = (bootpMessage: BootpMessage) => {
  const op = opForNumber(bootpMessage.op.readUInt8());
  if (typeof op === "undefined")
    throw new Error("Unexpected op " + bootpMessage.op.readUint8());
  const htype = htypeForNumber(bootpMessage.htype.readUInt8());
  if (typeof htype === "undefined")
    throw new Error("Unexpected htype " + bootpMessage.htype.readUint8());
  const hlen = bootpMessage.hlen.readUInt8();
  if (hlen !== 6) throw new Error("Unexpected hlen: " + hlen);

  const hops = bootpMessage.hops.readUint8();
  const xid = "0x" + bootpMessage.xid.toString("hex");
  const secs = bootpMessage.secs.readUint16BE();
  const broadcastFlag = !!(bootpMessage.flags.readUInt8() & 128);

  const ciaddr = ntop4(bootpMessage.ciaddr);
  const yiaddr = ntop4(bootpMessage.yiaddr);
  const siaddr = ntop4(bootpMessage.siaddr);
  const giaddr = ntop4(bootpMessage.giaddr);

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
