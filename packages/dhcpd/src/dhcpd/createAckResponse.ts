import type { Config } from '@neat-dhcpd/db';
import trpc from '../trpcClient.js';
import type { Address, ResponseResult } from './createResponse.js';
import { isParsedRequestOption } from './mapRequestOptions.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import createGetResponseOption from './createGetResponseOption.js';
import tap from '../lib/tap.js';
import { messageTypesForString } from './numberStrings.js';
import log from '../lib/log.js';
import type { Ip } from '@neat-dhcpd/common';
import { ZERO_ZERO_ZERO_ZERO, ipFromBuffer, ipFromNumber, ipFromString } from '@neat-dhcpd/common';
import { addSeconds } from 'date-fns';
import type { Trace } from '@neat-dhcpd/litel';
import rand from '../lib/rand.js';

const DEFAULT_MAX_MESSAGE_LENGTH = 1500;

const createAckResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config,
  parentTrace: Trace
): Promise<ResponseResult> => {
  using trace = parentTrace.startSubTrace('createAckResponse');
  const option53Value = request.options.options.find(isParsedRequestOption(53))?.value;
  if (option53Value !== 'DHCPREQUEST') {
    return {
      success: false,
      error: 'unexpected-option-53',
      expected: 'DHCPREQUEST',
      value: option53Value,
    };
  }

  const serverIdBuffer = request.options.options.find(isParsedRequestOption(54))?.content; // seems like not everyone sends this back
  const requestedIp = request.options.options.find(isParsedRequestOption(50))?.value;
  if (serverIdBuffer && ipFromBuffer(serverIdBuffer).num !== serverAddress.address.num) {
    if (requestedIp) {
      log('debug', { deletingOfferFor: request.chaddr });
      await trpc.offer.delete.mutate({
        mac: request.chaddr,
        remoteTracingId: trace.id,
      });
    }

    return { success: false, error: 'not-for-me' };
  }

  const { previousOffer, previouslyLeasedIp, offeredOrLeasedForOthers } =
    await trpc.aggregate.getIpOfferInfo.query({
      mac: request.chaddr,
      requestedIp: requestedIp?.str,
      remoteTracingId: trace.id,
    });

  let assignedIp: Ip;
  if (requestedIp) {
    if (requestedIp.str === previousOffer?.ip) assignedIp = requestedIp;
    else
      return {
        success: false,
        error: 'requested-invalid-ip',
        details:
          `Client requested ${requestedIp.str}, but was ` +
          (previousOffer
            ? `previously offered ${previousOffer.ip}.`
            : 'not offered anything before.'),
        requestedIp: requestedIp?.str,
        offeredIp: previousOffer?.ip,
        leasedIp: previouslyLeasedIp,
      };
  } else if (previousOffer) {
    return {
      success: false,
      error: 'requested-invalid-ip',
      details: `Client didn't have a requested IP - was previously offered ${previousOffer.ip}.`,
      offeredIp: previousOffer.ip,
      leasedIp: previouslyLeasedIp,
    };
  } else {
    const unavailableIpNumbers = offeredOrLeasedForOthers.map(
      (ipString) => ipFromString(ipString).num
    );
    const ipStart = ipFromString(config.ip_start);
    const ipEnd = ipFromString(config.ip_end);
    // TODO This stops working if there are a lot of assigned IPs in a big IP range.
    // Instead, create a list of valid ips and pick one randomly.
    let candidate = rand(ipStart.num, ipEnd.num);
    let triesLeft = 5000;
    for (; triesLeft > 0; triesLeft--) {
      candidate = rand(ipStart.num, ipEnd.num);
      if (!unavailableIpNumbers.includes(candidate)) break;
    }
    if (triesLeft <= 0) {
      return {
        success: false,
        error: 'no-ips-left',
      };
    } else {
      assignedIp = ipFromNumber(candidate);
    }
  }

  // TODO: clean up, deduplicate from `createOfferResponse`
  const getOption = createGetResponseOption(serverAddress, config, trace);
  const options =
    (
      await Promise.all(
        request.options.options
          .find(isParsedRequestOption(55))
          ?.value.map<Promise<[number, Uint8Array | undefined]>>(async ({ id }) => [
            id,
            await getOption(id),
          ]) ?? []
      )
    )
      .map(
        tap(
          (options) =>
            typeof options[1] === 'undefined' &&
            log('debug', 'unfulfilled requested option ' + options[0])
        )
      )
      .filter((t): t is [number, Uint8Array] => typeof t[1] !== 'undefined') ?? [];
  options.unshift([53, Buffer.of(messageTypesForString('DHCPACK'))]);

  const leaseTimeSeconds = previousOffer?.lease_time_secs ?? config.lease_time_minutes * 60;
  options.push([
    51,
    (() => {
      const leaseTimeBuffer = Buffer.alloc(4);
      leaseTimeBuffer.writeUInt32BE(leaseTimeSeconds);
      return leaseTimeBuffer;
    })(),
  ]);
  options.push([54, serverAddress.address.buf]);
  options.push([255, Buffer.alloc(0)]);

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
};

export default createAckResponse;
