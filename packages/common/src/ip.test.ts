import { getBroadcastAddr, ipFromString, readUint32BE, writeUint32BE } from './ip.js';
import { expect, describe, it, test } from 'vitest';

describe('writeUint32BE', () => {
  it('works', () => {
    const buffer = new Uint8Array(4);
    writeUint32BE(buffer, 0xaabbccdd);
    expect(buffer).toEqual(new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]));
  });
});

describe('readUint32BE', () => {
  it('works', () => {
    const buffer = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);
    expect(readUint32BE(buffer)).toEqual(0xaabbccdd);
  });
});

describe('ip', () => {
  test.each([{ ip: '192.168.0.3', netmask: '255.255.254.0', expected: '192.168.1.255' }])(
    'getBroadcastAddr($netmask, $ip) === $expected',
    ({ ip, netmask, expected }) => {
      const n = ipFromString(netmask);
      if (!n) throw new Error('netmask not an ip');
      const i = ipFromString(ip);
      if (!i) throw new Error('ip not an ip');
      const e = ipFromString(expected);
      if (!e) throw new Error('expected not an ip');
      expect(getBroadcastAddr(n, i)).toMatchObject(e);
    }
  );
});
