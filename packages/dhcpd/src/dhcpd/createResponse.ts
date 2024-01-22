import type { DhcpMessage } from './parseMessage';
import type { ParsedRequestOption } from './mapRequestOptions';
import type { DhcpRequest } from './parseRequestMessage';
import type { Config } from '@neat-dhcpd/db';
import createOfferResponse from './createOfferResponse';
import createAckResponse from './createAckResponse';
import type { Ip } from '@neat-dhcpd/common';

export type ResponseResult =
  | {
      success: true;
      maxMessageLength: number;
      responseIp: string;
      message: DhcpResponse;
    }
  | {
      success: false;
      error: 'no-type-option' | 'no-ips-left' | 'not-for-me' | 'malformatted-ip-start-or-end';
    }
  | {
      success: false;
      error: 'unhandled-type-option';
      id: ParsedRequestOption<53>['value'];
    }
  | {
      success: false;
      error: 'requested-invalid-ip';
      details?: string;
      requestedIp?: string;
      offeredIp: string | undefined;
      leasedIp: string | undefined;
    }
  | {
      success: false;
      error: 'unexpected-option-53';
      expected: ParsedRequestOption<53>['value'];
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
  config: Config
): Promise<ResponseResult> => {
  const typeOption = request.options.options.find(
    (o): o is ParsedRequestOption<53> => o.isParsed && o.name === 'DHCP Message Type'
  );
  if (!typeOption) return { success: false, error: 'no-type-option' } as const;

  switch (typeOption.value) {
    case 'DHCPDISCOVER':
      return await createOfferResponse(request, serverAddress, config);
    case 'DHCPREQUEST':
      return await createAckResponse(request, serverAddress, config);
    default:
      return {
        success: false,
        error: 'unhandled-type-option',
        id: typeOption.value,
      };
  }
};

export default createResponse;
