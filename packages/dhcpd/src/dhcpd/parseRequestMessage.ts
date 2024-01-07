import type { ParsedRequestOption } from './mapRequestOptions';
import mapRequestOption from './mapRequestOptions';
import type { DhcpMessage } from './parseMessage';
import type { UnparsedOption } from './parseOptions';

export type DhcpRequest = Omit<DhcpMessage, 'op' | 'options'> & {
  op: 'BOOTREQUEST';
  options: Omit<DhcpMessage['options'], 'options'> & {
    options: Array<UnparsedOption | ParsedRequestOption>;
  };
};

const parseRequestMessage = (msg: DhcpMessage): DhcpRequest => {
  const op = msg.op;
  if (op !== 'BOOTREQUEST') throw new Error(`Unexpected op: ${JSON.stringify(msg)}`);

  return {
    ...msg,
    op,
    options: {
      magicCookie: msg.options.magicCookie,
      options: msg.options.options.map(mapRequestOption) satisfies Array<
        UnparsedOption | ParsedRequestOption
      >,
    },
  };
};

export default parseRequestMessage;
