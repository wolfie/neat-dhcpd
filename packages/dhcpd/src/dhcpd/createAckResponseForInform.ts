import { ipFromString, ipIsWithinRange, ZERO_ZERO_ZERO_ZERO } from '@neat-dhcpd/common';
import type { Address, ResponseResult } from './createResponse.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import type { Trace } from '@neat-dhcpd/litel';
import type { Config } from '@neat-dhcpd/db';
import trpc from '../trpcClient.js';
import createAckOptions from './createAckOptions.js';
import { isParsedRequestOption } from './mapRequestOptions.js';
import { DEFAULT_MAX_MESSAGE_LENGTH } from './createAckResponse.js';

const createAckResponseForInform = async ({
  request,
  parentTrace,
  config,
  serverAddress,
}: {
  request: DhcpRequest;
  parentTrace: Trace;
  config: Config;
  serverAddress: Address;
}): Promise<ResponseResult> => {
  using trace = parentTrace.startSubTrace('createAckResponseForInform');

  const isInsideOfLeaseRange = ipIsWithinRange(request.ciaddr, {
    start: ipFromString(config.ip_start),
    end: ipFromString(config.ip_end),
  });
  const reservedIpForMac = await trpc.reservedIp.get.query({
    mac: request.chaddr,
    remoteTracingId: trace.id,
  });
  if (!isInsideOfLeaseRange && (!reservedIpForMac || reservedIpForMac.ip !== request.ciaddr.str)) {
    return {
      success: false,
      error: 'not-for-me',
      details: `${request.ciaddr.str} is an IP neither in my dynamic range, nor a reserved one for this client`,
    };
  }

  const options = await createAckOptions({
    request,
    config,
    leaseTimeInfo: { sendReply: false },
    parentTrace: trace,
    serverAddress,
  });

  const maxMessageLength =
    request.options.options.find(isParsedRequestOption(57))?.value ?? DEFAULT_MAX_MESSAGE_LENGTH;

  return {
    success: true,
    maxMessageLength,
    responseIp:
      request.options.options.find(isParsedRequestOption(50))?.value.str ?? '255.255.255.255',
    message: {
      op: 'BOOTREPLY',
      htype: request.htype,
      hlen: request.hlen,
      hops: 0,
      xid: request.xid,
      secs: 0,
      broadcastFlag: false,
      ciaddr: ZERO_ZERO_ZERO_ZERO,
      yiaddr: ZERO_ZERO_ZERO_ZERO, // no yiaddr for DHCPINFORM
      siaddr: serverAddress.address,
      giaddr: ZERO_ZERO_ZERO_ZERO,
      chaddr: request.chaddr,
      file: '',
      sname: '',
      options: {
        magicCookie: request.options.magicCookie,
        options,
      },
    },
  };
};

export default createAckResponseForInform;
