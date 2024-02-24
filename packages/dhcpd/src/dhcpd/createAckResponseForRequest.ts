import { ipFromString, type Ip, ZERO_ZERO_ZERO_ZERO } from '@neat-dhcpd/common';
import trpc from '../trpcClient.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import type { Trace } from '@neat-dhcpd/litel';
import type { Config } from '@neat-dhcpd/db';
import type { Address, ResponseResult } from './createResponse.js';
import getRandomAvailableIp from '../lib/getRandomAvailableIp.js';
import { addSeconds } from 'date-fns';
import { isParsedRequestOption } from './mapRequestOptions.js';
import createAckOptions from './createAckOptions.js';
import { DEFAULT_MAX_MESSAGE_LENGTH } from './createAckResponse.js';
import { messageTypesForString } from './numberStrings.js';
import log from '../lib/log.js';

const getNak = (request: DhcpRequest): ResponseResult => ({
  success: true,
  maxMessageLength: 1500,
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
    yiaddr: ZERO_ZERO_ZERO_ZERO,
    siaddr: ZERO_ZERO_ZERO_ZERO,
    giaddr: ZERO_ZERO_ZERO_ZERO,
    chaddr: request.chaddr,
    file: '',
    sname: '',
    options: {
      magicCookie: request.options.magicCookie,
      options: [[53, Buffer.of(messageTypesForString('DHCPNAK'))]],
    },
  },
});

async function createAckResponseForRequest({
  request,
  requestedIp,
  parentTrace,
  config,
  serverAddress,
}: {
  request: DhcpRequest;
  requestedIp: Ip | undefined;
  parentTrace: Trace;
  config: Config;
  serverAddress: Address;
}): Promise<ResponseResult> {
  using trace = parentTrace.startSubTrace('createAckResponseForRequest');
  const [{ reservedIp, previousOffer, previouslyLeasedIp, offeredOrLeasedForOthers }] =
    await Promise.all([
      trpc.aggregate.getIpOfferInfo.query({
        mac: request.chaddr,
        requestedIp: requestedIp?.str,
        remoteTracingId: trace.id,
      }),
    ]);

  let assignedIp: Ip;
  if (requestedIp) {
    if ([previousOffer?.ip, reservedIp, previouslyLeasedIp].includes(requestedIp.str))
      assignedIp = requestedIp;
    else {
      log(
        'debug',
        `Client requested ${requestedIp.str}, but was ` +
          (previousOffer
            ? `previously offered ${previousOffer.ip}. `
            : 'not offered anything before. ') +
          JSON.stringify({
            offeredIp: previousOffer?.ip ?? null,
            leasedIp: previouslyLeasedIp ?? null,
            reservedIp: reservedIp ?? null,
          })
      );
      return getNak(request);
    }
  } else if (previousOffer) {
    log(
      'debug',
      `Client didn't have a requested IP - was previously offered ${previousOffer.ip}. ` +
        JSON.stringify({
          offeredIp: previousOffer?.ip ?? null,
          leasedIp: previouslyLeasedIp ?? null,
          reservedIp: reservedIp ?? null,
        })
    );
    return getNak(request);
  } else {
    const result = getRandomAvailableIp({
      start: ipFromString(config.ip_start),
      end: ipFromString(config.ip_end),
      unavailableIps: offeredOrLeasedForOthers,
    });
    if (result === 'no-ips-left') {
      return {
        success: false,
        error: 'no-ips-left',
      };
    }
    assignedIp = result;
  }

  const leaseTimeSeconds = previousOffer?.lease_time_secs ?? config.lease_time_minutes * 60;
  const options = await createAckOptions({
    config,
    leaseTimeInfo: { sendReply: true, seconds: leaseTimeSeconds },
    parentTrace: trace,
    request,
    serverAddress,
  });

  if (config.send_replies) {
    await Promise.all([
      trpc.offer.delete.mutate({
        mac: request.chaddr,
        remoteTracingId: trace.id,
      }),
      trpc.lease.set.mutate({
        ip: assignedIp.str,
        expires_at: addSeconds(Date.now(), leaseTimeSeconds).toISOString(),
        mac: request.chaddr,
        remoteTracingId: trace.id,
      }),
    ]);
  }

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
      yiaddr: assignedIp,
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
}

export default createAckResponseForRequest;
