import type { Config } from '@neat-dhcpd/db';
import trpc from '../trpcClient';
import type { Address, ResponseResult } from './createResponse';
import { isParsedRequestOption } from './mapRequestOptions';
import type { DhcpRequest } from './parseRequestMessage';
import createGetResponseOption from './createGetResponseOption';
import tap from '../lib/tap';
import { messageTypesForString } from './numberStrings';
import log from '../lib/log';
import type { IpString } from '@neat-dhcpd/common';
import { ZERO_ZERO_ZERO_ZERO, ipFromBuffer, ipFromString } from '@neat-dhcpd/common';
import { addSeconds } from 'date-fns';
import findFreeIp from '../lib/findFreeIp';

const DEFAULT_MAX_MESSAGE_LENGTH = 1500;

const createAckResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config
): Promise<ResponseResult> => {
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
      });
    }

    return { success: false, error: 'not-for-me' };
  }

  // TODO renew lease if a valid lease already exists
  const [offer, existingLease] = await Promise.all([
    trpc.offer.get.query({ mac: request.chaddr }),
    trpc.lease.get.query({ mac: request.chaddr }),
  ]);
  log('debug', { ipsOnOffer: { offer, existingLease } });

  let assignedIp: IpString;
  if (requestedIp) {
    if (requestedIp.str === offer?.ip) assignedIp = requestedIp.str;
    else
      return {
        success: false,
        error: 'requested-invalid-ip',
        details:
          `Client requested ${requestedIp.str}, but was ` +
          (offer ? `previously offered ${offer.ip}.` : 'not offered anything before.'),
        requestedIp: requestedIp?.str,
        offeredIp: offer?.ip,
        leasedIp: existingLease?.ip,
      };
  } else if (offer) {
    return {
      success: false,
      error: 'requested-invalid-ip',
      details: `Client didn't have a requested IP - was previously offered ${offer.ip}.`,
      offeredIp: offer?.ip,
      leasedIp: existingLease?.ip,
    };
  } else {
    const freeIp = await findFreeIp(undefined, config);
    if (freeIp === 'no-ips-left') return { success: false, error: 'no-ips-left' };
    if (freeIp === 'malformatted-ip-start-or-end')
      return { success: false, error: 'malformatted-ip-start-or-end' };
    assignedIp = freeIp.str;
  }

  const getOption = createGetResponseOption(serverAddress, config);
  const options =
    request.options.options
      .find(isParsedRequestOption(55))
      ?.value.map<[number, Uint8Array | undefined]>(({ id }) => [id, getOption(id)])
      .map(
        tap(
          (options) =>
            typeof options[1] === 'undefined' &&
            log('debug', 'unfulfilled requested option ' + options[0])
        )
      )
      .filter((t): t is [number, Uint8Array] => typeof t[1] !== 'undefined') ?? [];
  options.unshift([53, Buffer.of(messageTypesForString('DHCPACK'))]);

  const leaseTimeSeconds = offer?.lease_time_secs ?? config.lease_time_minutes * 60;
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
      trpc.offer.delete.mutate({ mac: request.chaddr }),
      trpc.lease.set.mutate({
        ip: assignedIp,
        expires_at: addSeconds(Date.now(), leaseTimeSeconds).toISOString(),
        mac: request.chaddr,
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
      yiaddr: ipFromString(assignedIp),
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
