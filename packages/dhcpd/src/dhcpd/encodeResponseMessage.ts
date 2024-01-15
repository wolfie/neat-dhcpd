import type { DhcpResponse } from './createResponse';
import { htypeForString, opForString } from './numberStrings';
import type { BootpMessage } from './splitBootpMessage';

const encodeResponseMessage = (
  message: DhcpResponse,
  original: BootpMessage,
  maxMessageLength: number
) => {
  const buffer = Buffer.alloc(maxMessageLength);
  let i = 0;
  const $ = (postInc: number) => {
    const prev = i;
    i += postInc;
    return prev;
  };

  buffer.writeUInt8(opForString('BOOTREPLY'), $(1));
  buffer.writeUInt8(htypeForString(message.htype), $(1));
  buffer.writeUInt8(message.hlen, $(1));
  buffer.writeUInt8(0, $(1)); // hops
  original.xid.copy(buffer, $(4));
  buffer.writeUInt16BE(message.secs, $(2));
  buffer.writeUInt16BE(message.broadcastFlag ? 1 : 0, $(2));
  buffer.writeUInt32BE(message.ciaddr.num, $(4));
  buffer.writeUInt32BE(message.yiaddr.num, $(4));
  buffer.writeUInt32BE(message.siaddr.num, $(4));
  buffer.writeUInt32BE(message.giaddr.num, $(4));

  const chaddr = Buffer.alloc(16);
  message.chaddr
    .split(':')
    .map((x) => parseInt(x, 16))
    .forEach((n, i) => chaddr.writeUInt8(n, i));
  chaddr.copy(buffer, $(16));

  i += 192; // skip sname and file

  original.options.copy(buffer, $(4), 0, 4); // magic cookie

  message.options.options.forEach(([optionCode, optionBuffer]) => {
    buffer.writeUInt8(optionCode, $(1));
    buffer.writeUInt8(optionBuffer.length, $(1));
    for (let j = 0; j < optionBuffer.length; j++) buffer.writeUint8(optionBuffer[j], $(1));
  });

  return buffer.subarray(0, i);
};

export default encodeResponseMessage;
