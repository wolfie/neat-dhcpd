type IpString = `${number}.${number}.${number}.${number}`;

export type Ip = {
  num: number;
  buf: Buffer;
  str: IpString;
};

export const isIpString = (str: string): str is IpString =>
  !!str.match(/^\d+\.\d+\.\d+\.\d+$/);

export const isCidr = (str: string): str is `${IpString}/${number}` =>
  !!str.match(/^\d+\.\d+\.\d+\.\d+\/\d+$/);

export const ipFromNumber = (num: number): Ip => {
  const buf = Buffer.alloc(4);
  buf.writeUint32BE(num);
  const str = [
    buf.readUint8(0),
    buf.readUint8(1),
    buf.readUint8(2),
    buf.readUint8(3),
  ].join(".") as IpString;
  return { buf, num, str };
};

export function ipFromString(str: IpString): Ip;
export function ipFromString(str: string): Ip | undefined;
export function ipFromString(str: string): Ip | undefined {
  const match = str.match(/^\d+\.\d+\.\d+\.\d+$/);
  if (!match) return undefined;
  const [a, b, c, d] = str.split(".").map((x) => parseInt(x));
  const buf = Buffer.alloc(4);
  buf.writeUint8(a, 0);
  buf.writeUint8(b, 1);
  buf.writeUint8(c, 2);
  buf.writeUint8(d, 3);
  const num = buf.readUInt32BE();
  return { buf, num, str: str as IpString };
}

export function ipFromBuffer(buf: Buffer): Ip {
  const num = buf.readUInt32BE();
  const str = [
    buf.readUint8(0),
    buf.readUint8(1),
    buf.readUint8(2),
    buf.readUint8(3),
  ].join(".") as IpString;

  return { buf: buf.subarray(0, 4), num, str };
}

export function getBroadcastAddr(cidr: string): Ip | undefined;
export function getBroadcastAddr(cidr: `${IpString}/${number}`): Ip;
export function getBroadcastAddr(netmask: Ip, ipAddress: Ip): Ip;
export function getBroadcastAddr(
  a: Ip | string,
  ipAddress?: Ip
): Ip | undefined {
  let netmask: Ip;
  if (typeof a === "string") {
    if (!isCidr(a)) return undefined;
    const [ipStr, _netmaskLength] = a.split("/", 2) as [IpString, string];
    ipAddress = ipFromString(ipStr);
    const netmaskLength = parseInt(_netmaskLength);
    const netmaskNumber = parseInt(
      Array(netmaskLength).fill("1").join("").padEnd(32, "0"),
      2
    );
    netmask = ipFromNumber(netmaskNumber);
  } else {
    netmask = a;
    ipAddress = ipAddress!;
  }
  const inverseNetmask = netmask.buf.map((n) => 255 - n);
  const broadcastArray = ipAddress.buf.map(
    (n, i) => (n & netmask.buf.readUint8(i)) | inverseNetmask[i]
  );
  return ipFromBuffer(Buffer.from(broadcastArray));
}

export const ZERO_ZERO_ZERO_ZERO = Object.freeze(ipFromString("0.0.0.0"));
