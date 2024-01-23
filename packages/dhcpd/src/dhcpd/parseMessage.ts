import type { MagicCookie, UnparsedOption } from './parseOptions.js';
import type { BootpMessage } from './splitBootpMessage.js';
import type { HType } from './numberStrings.js';
import type { Ip } from '@neat-dhcpd/common';
import { ipFromBuffer } from '@neat-dhcpd/common';
import parseOptions from './parseOptions.js';
import { htypeForNumber, opForNumber } from './numberStrings.js';

export type DhcpMessage = {
  op: 'BOOTREQUEST' | 'BOOTREPLY';
  htype: HType;
  hlen: number;
  hops: number;
  xid: string;
  secs: number;
  broadcastFlag: boolean;
  ciaddr: Ip;
  yiaddr: Ip;
  siaddr: Ip;
  giaddr: Ip;
  chaddr: string;
  sname: string;
  file: string;
  options: { magicCookie: MagicCookie; options: UnparsedOption[] };
};

const parseMessage = (
  bootpMessage: BootpMessage
):
  | { success: false; errorField: 'op' | 'htype' | 'hlen'; value: number; buffer: Buffer }
  | { success: false; errorField: 'options.magic-cookie'; value: `0x${string}`; buffer: Buffer }
  | { success: true; message: DhcpMessage } => {
  const op = opForNumber(bootpMessage.op.readUInt8());
  if (typeof op === 'undefined')
    return {
      success: false,
      errorField: 'op',
      value: bootpMessage.op.readUint8(),
      buffer: bootpMessage.__original,
    };

  const htype = htypeForNumber(bootpMessage.htype.readUInt8());
  if (typeof htype === 'undefined')
    return {
      success: false,
      errorField: 'htype',
      value: bootpMessage.htype.readUint8(),
      buffer: bootpMessage.__original,
    };

  const hlen = bootpMessage.hlen.readUInt8();
  if (hlen !== 6)
    return {
      success: false,
      errorField: 'hlen',
      value: hlen,
      buffer: bootpMessage.__original,
    };

  const hops = bootpMessage.hops.readUint8();
  const xid = '0x' + bootpMessage.xid.toString('hex');
  const secs = bootpMessage.secs.readUint16BE();
  const broadcastFlag = !!(bootpMessage.flags.readUInt8() & 128);

  const ciaddr = ipFromBuffer(bootpMessage.ciaddr);
  const yiaddr = ipFromBuffer(bootpMessage.yiaddr);
  const siaddr = ipFromBuffer(bootpMessage.siaddr);
  const giaddr = ipFromBuffer(bootpMessage.giaddr);

  const chaddr = [
    bootpMessage.chaddr.subarray(0, 1).toString('hex'),
    bootpMessage.chaddr.subarray(1, 2).toString('hex'),
    bootpMessage.chaddr.subarray(2, 3).toString('hex'),
    bootpMessage.chaddr.subarray(3, 4).toString('hex'),
    bootpMessage.chaddr.subarray(4, 5).toString('hex'),
    bootpMessage.chaddr.subarray(5, 6).toString('hex'),
  ].join(':');

  const sname = bootpMessage.sname.toString('hex');
  const file = bootpMessage.file.toString('hex');

  const options = parseOptions(bootpMessage.options);

  if (!options.success)
    return {
      success: false,
      errorField: 'options.magic-cookie',
      value: options.value,
      buffer: bootpMessage.__original,
    };

  return {
    success: true,
    message: {
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
    },
  };
};

export default parseMessage;
