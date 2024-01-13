export type UnparsedOption = {
  isParsed: false;
  optionCode: number;
  hex: string;
  content: Buffer;
};

function* generateOptions(buffer: Buffer): Generator<UnparsedOption, void, unknown> {
  let offset = 0;
  while (offset <= buffer.length) {
    const optionCode = buffer.readUint8(offset);
    if (optionCode === 0xff) break;

    const length = buffer.readUint8(offset + 1);
    const content = buffer.subarray(offset + 2, offset + 2 + length);
    const hex = content.toString('hex');

    yield {
      isParsed: false,
      optionCode,
      hex,
      content,
    } satisfies UnparsedOption;

    offset += 2 + length;
  }
}

export type MagicCookie = '0x63825363';
const parseOptions = (
  option: Buffer
):
  | { success: true; magicCookie: MagicCookie; options: UnparsedOption[] }
  | { success: false; error: 'unexpected-magic-cookie'; value: `0x${string}` } => {
  const magicCookie = ('0x' + option.subarray(0, 4).toString('hex')) as MagicCookie;
  const options: UnparsedOption[] = [];
  if (magicCookie !== '0x63825363')
    return { success: false, error: 'unexpected-magic-cookie', value: magicCookie };

  const optionsBuffer = option.subarray(4);
  for (const option of generateOptions(optionsBuffer)) {
    options.push(option);
  }

  return { success: true, magicCookie, options };
};

export default parseOptions;
