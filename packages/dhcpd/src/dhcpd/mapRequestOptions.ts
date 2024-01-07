import { ipFromBuffer } from '../lib/ip';
import { htypeForNumber, messageTypesForNumber } from './numberStrings';
import PARAMETER_REQUEST_LIST from './parameterRequestList';
import type { UnparsedOption } from './parseOptions';

const OPTION_PARSER = {
  12: {
    name: 'Host Name',
    parse: (content: Buffer) => content.toString('ascii'),
  },
  50: {
    name: 'Requested IP address',
    parse: (content: Buffer) => ipFromBuffer(content),
  },
  51: {
    name: 'IP address lease time',
    parse: (content: Buffer) => ({ seconds: content.readUint32BE() }),
  },
  53: {
    name: 'DHCP Message Type',
    parse: (content: Buffer) => messageTypesForNumber(content.readUint8()),
  },
  54: {
    name: 'Server Identifier',
    parse: (content: Buffer) => content.toString('hex'),
  },
  55: {
    name: 'Parameter Request List',
    parse: (content: Buffer) => {
      const data: {
        id: number;
        name: (typeof PARAMETER_REQUEST_LIST)[number];
      }[] = [];
      for (let i = 0; i < content.length; i++) {
        const id = content.readUint8(i);
        data.push({
          id,
          name: PARAMETER_REQUEST_LIST[id],
        });
      }
      return data;
    },
  },
  57: {
    name: 'Maximum DHCP message size',
    parse: (content: Buffer) => content.readUint16BE(),
  },
  60: {
    name: 'Vendor class identifier',
    parse: (content: Buffer) => content.toString('ascii'),
  },
  61: {
    name: 'Client identifier',
    parse: (content: Buffer) => ({
      type: htypeForNumber(content.readUInt8()),
      content: content.subarray(1).toString('hex'),
    }),
  },
  80: {
    name: 'Rapid Commit',
    parse: () => true,
  },
  81: {
    // https://www.rfc-editor.org/rfc/rfc4702.txt
    name: 'Client FQDN',
    parse: (content: Buffer) => {
      const flags = content.readUint8(0);
      const n = !!(flags & 0b00001000);
      const e = !!(flags & 0b00000100);
      const o = !!(flags & 0b00000010);
      const s = !!(flags & 0b00000001);
      const rcode1 = content.readUint8(1);
      const rcode2 = content.readUint8(2);
      const domainname = content.subarray(3).toString('ascii');

      return {
        flags: { n, e, o, s },
        rcodes: [rcode1, rcode2],
        domainname,
      };
    },
  },
} as const;

const KNOWN_OPTION_IDS = Object.keys(OPTION_PARSER).map((key) => parseInt(key)) as Array<
  keyof typeof OPTION_PARSER
>;
export type KnownRequestOptionId = (typeof KNOWN_OPTION_IDS)[number];

export type ParsedRequestOption__<T extends KnownRequestOptionId = KnownRequestOptionId> = {
  isParsed: true;
  optionCode: T;
  hex: string;
  content: Buffer;
  name: (typeof OPTION_PARSER)[T]['name'];
  value: ReturnType<(typeof OPTION_PARSER)[T]['parse']>;
};
// somehow this tricks the TS type system to properly split the types
export type ParsedRequestOption<T = KnownRequestOptionId> = T extends KnownRequestOptionId
  ? ParsedRequestOption__<T>
  : never;

export const isParsedRequestOption =
  <T extends KnownRequestOptionId = KnownRequestOptionId>(id?: T) =>
  (option: ParsedRequestOption | UnparsedOption): option is ParsedRequestOption<T> =>
    option.isParsed && (typeof id === 'undefined' || option.optionCode === id);

const mapRequestOption = <T extends UnparsedOption>(option: T): T | ParsedRequestOption => {
  if (!KNOWN_OPTION_IDS.includes(option.optionCode as KnownRequestOptionId)) return option;
  const id = option.optionCode as KnownRequestOptionId;
  return {
    ...option,
    isParsed: true,
    name: OPTION_PARSER[id].name,
    value: OPTION_PARSER[id].parse(option.content),
  } as ParsedRequestOption;
};

export default mapRequestOption;
