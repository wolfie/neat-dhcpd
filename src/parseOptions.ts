const DhcpMessageTypes = [
  "DHCPDISCOVER",
  "DHCPOFFER",
  "DHCPREQUEST",
  "DHCPDECLINE",
  "DHCPACK",
  "DHCPNAK",
  "DHCPRELEASE",
  "DHCPINFORM",
  "DHCPFORCERENEW",
  "DHCPLEASEQUERY",
  "DHCPLEASEUNASSIGNED",
  "DHCPLEASEUNKNOWN",
  "DHCPLEASEACTIVE",
  "DHCPBULKLEASEQUERY",
  "DHCPLEASEQUERYDONE",
  "DHCPACTIVELEASEQUERY",
  "DHCPLEASEQUERYSTATUS",
  "DHCPTLS",
] as const;

const parseOption = (
  buffer: Buffer
): {
  newOffset: number;
  optionCode: number;
  hexContent: string;
  name?: string;
  data?: unknown;
} => {
  const optionCode = buffer.readUint8(0);
  const length = buffer.readUint8(1);
  const content = buffer.subarray(2, 2 + length);

  let data: unknown = undefined;
  let name: string | undefined = undefined;
  switch (optionCode) {
    case 53:
      name = "DHCP Message Type";
      data = DhcpMessageTypes[content.readUint8()];
      break;
    case 55:
      name = "Parameter Request List";
      data = [];
      for (let i = 0; i < length; i++) {
        (data as any[]).push(content.readUint8(i));
      }
      break;
    // case 114: // apple captive portal?
  }

  return {
    newOffset: 2 + length,
    optionCode,
    hexContent: content.toString("hex"),
    ...(name ? { name } : undefined),
    ...(data ? { data } : undefined),
  };
};

const parseOptions = (option: Buffer) => {
  const magicCookie = "0x" + option.subarray(0, 4).toString("hex");
  const options: { optionCode: number; hexContent: string; data?: unknown }[] =
    [];
  if (magicCookie !== "0x63825363")
    throw new Error("unexpected magic cookie " + magicCookie);

  const optionsBuffer = option.subarray(4);
  let offset = 0;
  while (offset <= optionsBuffer.length) {
    const { hexContent, newOffset, optionCode, data } = parseOption(
      optionsBuffer.subarray(offset)
    );
    options.push({ optionCode, hexContent, data });
    offset = newOffset;
  }

  return { magicCookie, options };
};

export default parseOptions;
