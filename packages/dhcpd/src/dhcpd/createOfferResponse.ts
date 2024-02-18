import type { Config } from '@neat-dhcpd/db';
import type { Address, ResponseResult } from './createResponse.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import { isParsedRequestOption } from './mapRequestOptions.js';
import { messageTypesForString } from './numberStrings.js';
import tap from '../lib/tap.js';
import trpc from '../trpcClient.js';
import createGetResponseOption from './createGetResponseOption.js';
import log from '../lib/log.js';
import type { Ip } from '@neat-dhcpd/common';
import { ZERO_ZERO_ZERO_ZERO, ipFromString, ipIsWithinRange } from '@neat-dhcpd/common';
import type { Trace } from '@neat-dhcpd/litel';
import getRandomAvailableIp from '../lib/getRandomAvailableIp.js';

const DEFAULT_MAX_MESSAGE_LENGTH = 1500;

const createOfferResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config,
  parentTrace: Trace
): Promise<ResponseResult> => {
  using trace = parentTrace.startSubTrace('createOfferResponse');
  const option53Value = request.options.options.find(isParsedRequestOption(53))?.value;
  if (option53Value !== 'DHCPDISCOVER') {
    return {
      success: false,
      error: 'unexpected-option-53',
      expected: 'DHCPDISCOVER',
      value: option53Value,
    };
  }

  const maxMessageLength =
    request.options.options.find(isParsedRequestOption(57))?.value ?? DEFAULT_MAX_MESSAGE_LENGTH;

  // TODO: clean up, deduplicate from `createAckResponse`
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

  options.unshift([53, Buffer.of(messageTypesForString('DHCPOFFER'))]);

  const configLeaseTimeSecs = config.lease_time_minutes * 60;
  const leaseTimeSecs = Math.min(
    configLeaseTimeSecs,
    request.options.options.find(isParsedRequestOption(51))?.value.seconds ?? configLeaseTimeSecs
  );

  options.push([51, Buffer.of(leaseTimeSecs)]);
  options.push([54, serverAddress.address.buf]);
  options.push([255, Buffer.alloc(0)]);

  const requestedIp = request.options.options.find(isParsedRequestOption(50))?.value;
  const ipOfferInfo = await trpc.aggregate.getIpOfferInfo.query({
    mac: request.chaddr,
    requestedIp: requestedIp?.str,
    remoteTracingId: trace.id,
  });

  const ipStart = ipFromString(config.ip_start);
  const ipEnd = ipFromString(config.ip_end);
  let offeredIp: Ip | 'no-ips-left';

  if (ipOfferInfo.reservedIp) {
    offeredIp = ipFromString(ipOfferInfo.reservedIp);
  } else if (ipOfferInfo.previousOffer) {
    offeredIp = ipFromString(ipOfferInfo.previousOffer.ip);
  } else if (ipOfferInfo.previouslyLeasedIp) {
    offeredIp = ipFromString(ipOfferInfo.previouslyLeasedIp);
  } else if (
    requestedIp &&
    ipIsWithinRange(requestedIp, { start: ipStart, end: ipEnd }) &&
    ipOfferInfo.offeredOrLeasedForOthers.every((ipInUse) => ipInUse !== requestedIp.str)
  ) {
    offeredIp = requestedIp;
  } else {
    offeredIp = getRandomAvailableIp({
      start: ipStart,
      end: ipEnd,
      unavailableIps: ipOfferInfo.offeredOrLeasedForOthers,
    });
  }

  if (typeof offeredIp === 'string') return { success: false, error: offeredIp };

  log('debug', {
    storingOffer: { ip: offeredIp.str, mac: request.chaddr, lease_time_secs: leaseTimeSecs },
  });

  if (config?.send_replies) {
    await trpc.offer.add.mutate({
      ip: offeredIp.str,
      mac: request.chaddr,
      lease_time_secs: leaseTimeSecs,
      remoteTracingId: trace.id,
    });
  }

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
      yiaddr: offeredIp,
      siaddr: serverAddress.address,
      giaddr: ZERO_ZERO_ZERO_ZERO,
      chaddr: request.chaddr,
      file: '',
      sname: '',
      options: {
        magicCookie: request.options.magicCookie,
        options: options.sort((a) => (a[0] === 1 ? -1 : 0)), // makes sure that option 1 is always before option 3: https://datatracker.ietf.org/doc/html/rfc2132#section-3.3
      },
    },
  };
};

export default createOfferResponse;
