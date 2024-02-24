import type { DhcpMessage } from './parseMessage.js';
import type { ParsedRequestOption } from './mapRequestOptions.js';
import type { DhcpRequest } from './parseRequestMessage.js';
import type { Config } from '@neat-dhcpd/db';
import createOfferResponse from './createOfferResponse.js';
import createAckResponse from './createAckResponse.js';
import type { Ip } from '@neat-dhcpd/common';
import type { Trace } from '@neat-dhcpd/litel';
import type { DhcpMessageType } from './numberStrings.js';

export type ResponseResult =
  | {
      success: true;
      maxMessageLength: number;
      responseIp: string;
      message: DhcpResponse;
    }
  | {
      success: false;
      error: 'no-type-option' | 'no-ips-left' | 'not-for-me';
      details?: string;
    }
  | {
      success: false;
      error: 'unhandled-type-option';
      id: DhcpMessageType;
    }
  | {
      success: false;
      error: 'unexpected-option-53';
      expected: DhcpMessageType | DhcpMessageType[];
      value: string | undefined;
    };

export type DhcpResponse = Omit<DhcpMessage, 'op' | 'options'> & {
  op: 'BOOTREPLY';
  options: {
    magicCookie: string;
    options: Array<[number, Uint8Array]>;
  };
};

export type Address = {
  address: Ip;
  netmask: Ip;
};

const createResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config,
  parentTrace: Trace
): Promise<ResponseResult> => {
  using trace = parentTrace.startSubTrace('createResponse');
  const typeOption = request.options.options.find(
    (o): o is ParsedRequestOption<53> => o.isParsed && o.name === 'DHCP Message Type'
  );
  if (!typeOption?.value) return { success: false, error: 'no-type-option' } as const;

  switch (typeOption.value) {
    case 'DHCPDISCOVER':
      return await createOfferResponse(request, serverAddress, config, trace);
    case 'DHCPREQUEST':
    case 'DHCPINFORM':
      return await createAckResponse(request, serverAddress, config, trace);
    default:
      return {
        success: false,
        error: 'unhandled-type-option',
        id: typeOption.value,
      };
  }
};

export default createResponse;
