import type { Config } from '@neat-dhcpd/db';
import type { Address, ResponseResult } from './createResponse';
import type { DhcpRequest } from './parseRequestMessage';
import { isParsedRequestOption } from './mapRequestOptions';
import { messageTypesForString } from './numberStrings';
import tap from '../lib/tap';
import trpc from '../trpcClient';
import rand from '../lib/rand';
import createGetResponseOption from './createGetResponseOption';
import log from '../lib/log';
import type { Ip } from '../lib/ip';
import { ZERO_ZERO_ZERO_ZERO, ipFromNumber, ipFromString } from '../lib/ip';

const findFreeIpN = async (
  requestedAddress: { mac: string; ip: Ip } | undefined,
  config: Config
) => {
  const ipStartN = ipFromString(config.ip_start);
  const ipEndN = ipFromString(config.ip_end);
  if (!ipStartN || !ipEndN) {
    return 'malformatted-ip-start-or-end' as const;
  }

  const reservedIps = await Promise.all([
    trpc.leasesGet.query().then((leases) => leases.map((l) => ({ mac: l.mac, ip: l.ip }))),
    trpc.offersGet.query().then((offers) => offers.map((o) => ({ mac: o.mac, ip: o.ip }))),
  ]).then(([leases, offers]) => leases.concat(offers));

  if (
    requestedAddress &&
    ipStartN.num <= requestedAddress.ip.num &&
    requestedAddress.ip.num <= ipEndN.num
  ) {
    const occupiedLease = reservedIps.find((l) => l.ip === requestedAddress.ip.str);
    if (!occupiedLease || occupiedLease.mac === requestedAddress.mac) {
      return requestedAddress.ip;
    }
  }

  const reservedIpNs = reservedIps.map((l) => ipFromString(l.ip).num);

  let candidate = rand(ipFromString('169.254.0.0').num, ipFromString('169.254.255.255').num);
  let triesLeft = 5000;
  for (; triesLeft > 0; triesLeft--) {
    candidate = rand(ipStartN.num, ipEndN.num);
    if (!reservedIpNs.includes(candidate)) break;
  }
  if (triesLeft <= 0) {
    return 'no-ips-left' as const;
  }
  return ipFromNumber(candidate);
};

const DEFAULT_MAX_MESSAGE_LENGTH = 1500;

const createOfferResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config
): Promise<ResponseResult> => {
  const option53Value = request.options.options.find(isParsedRequestOption(53))?.value;
  if (option53Value !== 'DHCPREQUEST') {
    return {
      success: false,
      error: 'unexpected-option-53',
      expected: 'DHCPDISCOVER',
      value: option53Value,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clientIdentifier = (() => {
    const cid = request.options.options.find(isParsedRequestOption(61));
    return cid ? `${cid.value.type}:${cid.value.content}` : request.chaddr;
  })();

  const maxMessageLength =
    request.options.options.find(isParsedRequestOption(57))?.value ?? DEFAULT_MAX_MESSAGE_LENGTH;

  const getOption = createGetResponseOption(serverAddress, config);

  const options =
    request.options.options
      .find(isParsedRequestOption(55))
      ?.value.map<[number, Buffer | undefined]>(({ id }) => [id, getOption(id)])
      .map(
        tap(
          (options) =>
            typeof options[1] === 'undefined' &&
            log('debug', 'unfulfilled requested option ' + options[0])
        )
      )
      .filter((t): t is [number, Buffer] => typeof t[1] !== 'undefined') ?? [];

  // TODO make sure option 1 is ordered before option 3

  options.unshift([53, Buffer.of(messageTypesForString('DHCPOFFER'))]);

  const leaseTimeSecs = Math.min(
    config.lease_time_minutes,
    request.options.options.find(isParsedRequestOption(51))?.value.seconds ??
      config.lease_time_minutes
  );

  options.push([51, Buffer.of(leaseTimeSecs)]);
  options.push([54, serverAddress.address.buf]);
  options.push([255, Buffer.alloc(0)]);

  const requestedIp = request.options.options.find(isParsedRequestOption(50))?.value;
  const offeredIp = await findFreeIpN(
    requestedIp ? { mac: request.chaddr, ip: requestedIp } : undefined,
    config
  );

  if (typeof offeredIp === 'string') return { success: false, error: offeredIp };

  await trpc.offerAdd.mutate({
    ip: offeredIp.str,
    mac: request.chaddr,
    lease_time_secs: leaseTimeSecs,
  });

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
        options,
      },
    },
  };
};

export default createOfferResponse;
