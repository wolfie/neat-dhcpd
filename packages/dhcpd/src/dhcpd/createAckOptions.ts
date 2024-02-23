import type { Config } from '@neat-dhcpd/db';
import createGetResponseOption from './createGetResponseOption.js';
import type { Address } from './createResponse.js';
import { isParsedRequestOption } from './mapRequestOptions.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import type { Trace } from '@neat-dhcpd/litel';
import tap from '../lib/tap.js';
import log from '../lib/log.js';
import { messageTypesForString } from './numberStrings.js';

const createAckOptions = async ({
  request,
  serverAddress,
  config,
  parentTrace,
  leaseTimeInfo,
}: {
  request: DhcpRequest;
  serverAddress: Address;
  config: Config;
  parentTrace: Trace;
  leaseTimeInfo: { sendReply: false } | { sendReply: true; seconds: number };
}) => {
  using trace = parentTrace.startSubTrace('createAckOptions');

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

  if (leaseTimeInfo.sendReply) {
    options.push([
      51,
      (() => {
        const leaseTimeBuffer = Buffer.alloc(4);
        leaseTimeBuffer.writeUInt32BE(leaseTimeInfo.seconds);
        return leaseTimeBuffer;
      })(),
    ]);
  }
  options.push([54, serverAddress.address.buf]);
  options.push([255, Buffer.alloc(0)]);
  return options;
};

export default createAckOptions;
