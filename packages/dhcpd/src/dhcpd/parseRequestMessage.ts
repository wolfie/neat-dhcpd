import type { ParsedRequestOption } from './mapRequestOptions.js';
import mapRequestOption from './mapRequestOptions.js';
import type { DhcpMessage } from './parseMessage.js';
import type { UnparsedOption } from './parseOptions.js';

export type DhcpRequest = Omit<DhcpMessage, 'op' | 'options'> & {
  op: 'BOOTREQUEST';
  options: Omit<DhcpMessage['options'], 'options'> & {
    options: Array<UnparsedOption | ParsedRequestOption>;
  };
};

const parseRequestMessage = (
  msg: DhcpMessage
): { success: false; error: 'unexpected-op-value' } | { success: true; request: DhcpRequest } => {
  const op = msg.op;
  if (op !== 'BOOTREQUEST') return { success: false, error: 'unexpected-op-value' };

  return {
    success: true,
    request: {
      ...msg,
      op,
      options: {
        magicCookie: msg.options.magicCookie,
        options: msg.options.options.map(mapRequestOption) satisfies Array<
          UnparsedOption | ParsedRequestOption
        >,
      },
    },
  };
};

export default parseRequestMessage;
