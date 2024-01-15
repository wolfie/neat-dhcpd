export type IpString = `${number}.${number}.${number}.${number}`;

export const writeUint32BE = (arr: Uint8Array, n: number) => {
  arr[0] = (n & 0xff000000) / 0x1000000;
  arr[1] = (n & 0x00ff0000) / 0x10000;
  arr[2] = (n & 0x0000ff00) / 0x100;
  arr[3] = (n & 0x000000ff) / 0x1;
};

export const readUint32BE = (arr: Uint8Array) => {
  let n = 0;
  n += arr[0] * 0x1000000;
  n += arr[1] * 0x10000;
  n += arr[2] * 0x100;
  n += arr[3] * 0x1;
  return n;
};

export type Ip = {
  num: number;
  buf: Uint8Array;
  str: IpString;
};

export const isIpString = (str: string): str is IpString => !!str.match(/^\d+\.\d+\.\d+\.\d+$/);

export const isCidr = (str: string): str is `${IpString}/${number}` =>
  !!str.match(/^\d+\.\d+\.\d+\.\d+\/\d+$/);

export const ipFromNumber = (num: number): Ip => {
  const buf = new Uint8Array(4);
  writeUint32BE(buf, num);
  const str = [buf[0], buf[1], buf[2], buf[3]].join('.') as IpString;
  return { buf, num, str };
};

export function ipFromString(str: IpString): Ip;
export function ipFromString(str: string): Ip | undefined;
export function ipFromString(str: string): Ip | undefined {
  const match = str.match(/^\d+\.\d+\.\d+\.\d+$/);
  if (!match) return undefined;
  const [a, b, c, d] = str.split('.').map((x) => parseInt(x));
  const buf = new Uint8Array(4);
  buf[0] = a;
  buf[1] = b;
  buf[2] = c;
  buf[3] = d;
  const num = readUint32BE(buf);
  return { buf, num, str: str as IpString };
}

export function ipFromBuffer(buf: Uint8Array): Ip {
  const num = readUint32BE(buf);
  const str = [buf[0], buf[1], buf[2], buf[3]].join('.') as IpString;
  return { buf: buf.subarray(0, 4), num, str };
}

export function getBroadcastAddr(cidr: string): Ip | undefined;
export function getBroadcastAddr(cidr: `${IpString}/${number}`): Ip;
export function getBroadcastAddr(netmask: Ip, ipAddress: Ip): Ip;
export function getBroadcastAddr(a: Ip | string, ipAddress?: Ip): Ip | undefined {
  let netmask: Ip;
  if (typeof a === 'string') {
    if (!isCidr(a)) return undefined;
    const [ipStr, _netmaskLength] = a.split('/', 2) as [IpString, string];
    ipAddress = ipFromString(ipStr);
    const netmaskLength = parseInt(_netmaskLength);
    const netmaskNumber = parseInt(Array(netmaskLength).fill('1').join('').padEnd(32, '0'), 2);
    netmask = ipFromNumber(netmaskNumber);
  } else {
    netmask = a;
    ipAddress = ipAddress!;
  }
  const inverseNetmask = netmask.buf.map((n) => 255 - n);
  const broadcastArray = ipAddress.buf.map((n, i) => (n & netmask.buf[i]) | inverseNetmask[i]);
  return ipFromBuffer(Uint8Array.from(broadcastArray));
}

export const ZERO_ZERO_ZERO_ZERO = Object.freeze(ipFromString('0.0.0.0'));

const LAN_ADDRESSES = [
  [ipFromString('192.168.0.0'), ipFromString('192.168.255.255')],
  [ipFromString('10.0.0.0'), ipFromString('10.255.255.255')],
  [ipFromString('172.16.0.0'), ipFromString('172.31.255.255')],
] as [Ip, Ip][];
export const isLanIp = (ip: Ip) =>
  LAN_ADDRESSES.flatMap(([from, to]) => from.num <= ip.num && ip.num <= to.num).some(Boolean);
