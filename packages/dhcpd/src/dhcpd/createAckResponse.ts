import type { Config } from '@neat-dhcpd/db';
import trpc from '../trpcClient.js';
import type { Address, ResponseResult } from './createResponse.js';
import { isParsedRequestOption } from './mapRequestOptions.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import type { DhcpMessageType } from './numberStrings.js';
import log from '../lib/log.js';
import type { Trace } from '@neat-dhcpd/litel';
import createAckResponseForInform from './createAckResponseForInform.js';
import type { Ip } from '@neat-dhcpd/common';
import { ZERO_ZERO_ZERO_ZERO, ipFromBuffer } from '@neat-dhcpd/common';
import createAckResponseForRequest from './createAckResponseForRequest.js';

export const DEFAULT_MAX_MESSAGE_LENGTH = 1500;

const zeroIpToUndefined = (ip: Ip) => (ip.str === ZERO_ZERO_ZERO_ZERO.str ? undefined : ip);

const HANDLED_53_VALUES = ['DHCPREQUEST', 'DHCPINFORM'] as const satisfies DhcpMessageType[];
const isHandled53Value = (x: unknown): x is (typeof HANDLED_53_VALUES)[number] =>
  typeof x === 'string' &&
  HANDLED_53_VALUES.includes(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    x as any
  );

const createAckResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config,
  parentTrace: Trace
): Promise<ResponseResult> => {
  using trace = parentTrace.startSubTrace('createAckResponse');
  const option53Value = request.options.options.find(isParsedRequestOption(53))?.value;
  if (!isHandled53Value(option53Value)) {
    return {
      success: false,
      error: 'unexpected-option-53',
      expected: HANDLED_53_VALUES,
      value: option53Value,
    };
  }

  const serverIdBuffer = request.options.options.find(isParsedRequestOption(54))?.content; // seems like not everyone sends this back
  const requestedIp =
    request.options.options.find(isParsedRequestOption(50))?.value ??
    zeroIpToUndefined(request.ciaddr);
  if (serverIdBuffer) {
    const serverIdIp = ipFromBuffer(serverIdBuffer);
    if (serverIdIp.num !== serverAddress.address.num) {
      if (requestedIp) {
        log('debug', { deletingOfferFor: request.chaddr });
        await trpc.offer.delete.mutate({
          mac: request.chaddr,
          remoteTracingId: trace.id,
        });
      }

      return {
        success: false,
        error: 'not-for-me',
        details: `requested server id (${serverIdIp.num}) does not match mine (${serverAddress.address.num})`,
      };
    }
  }

  switch (option53Value) {
    case 'DHCPREQUEST':
      return createAckResponseForRequest({
        request,
        requestedIp,
        parentTrace: trace,
        config,
        serverAddress,
      });
    case 'DHCPINFORM':
      return createAckResponseForInform({
        config,
        parentTrace: trace,
        request,
        serverAddress,
      });
  }

  // internal error
  return {
    success: false,
    error: 'unexpected-option-53',
    expected: HANDLED_53_VALUES,
    value: option53Value,
  };
};

export default createAckResponse;
