import type { Config } from '@neat-dhcpd/db';
import trpc from '../trpcClient';
import type { Address, ResponseResult } from './createResponse';
import { isParsedRequestOption } from './mapRequestOptions';
import type { DhcpRequest } from './parseRequestMessage';
import createGetResponseOption from './createGetResponseOption';
import tap from '../lib/tap';
import { messageTypesForString } from './numberStrings';
import log from '../lib/log';
import { ZERO_ZERO_ZERO_ZERO, ipFromBuffer, ipFromString } from '../lib/ip';

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

  const serverIdBuffer = request.options.options.find(isParsedRequestOption(54))?.content;
  if (!serverIdBuffer || ipFromBuffer(serverIdBuffer).num !== serverAddress.address.num) {
    const requestedIp = request.options.options.find(isParsedRequestOption(50))?.value.str;
    if (requestedIp) {
      trpc.offerDelete.mutate({
        ip: requestedIp,
        mac: request.chaddr,
      });
    }

    return { success: false, error: 'not-for-me' };
  }

  const requestedIp = request.options.options.find(isParsedRequestOption(50))?.value;
  // TODO renew lease if a valid lease already exists
  const [offer, existingLease] = await Promise.all([
    trpc.offerGet.query({ mac: request.chaddr }),
    trpc.leaseGet.query({ mac: request.chaddr }),
  ]);

  const assignedIp =
    requestedIp &&
    (requestedIp.str === offer?.ip
      ? offer.ip
      : requestedIp.str === existingLease?.ip
        ? existingLease.ip
        : undefined);

  if (!assignedIp) {
    return {
      success: false,
      error: 'requested-invalid-ip',
      requestedIp: requestedIp?.str,
      offeredIp: offer?.ip,
      leasedIp: existingLease?.mac,
    };
  }

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
  options.unshift([53, Buffer.of(messageTypesForString('DHCPACK'))]);

  options.push([
    51,
    (() => {
      const leaseTimeBuffer = Buffer.alloc(4);
      leaseTimeBuffer.writeUInt32BE(offer?.lease_time_secs ?? config.lease_time_minutes * 60);
      return leaseTimeBuffer;
    })(),
  ]);
  options.push([54, serverAddress.address.buf]);
  options.push([255, Buffer.alloc(0)]);

  // TODO insert lease

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
