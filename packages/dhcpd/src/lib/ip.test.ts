import { describe, expect, test } from 'vitest';
import { getBroadcastAddr, ipFromString } from './ip';

describe('ip', () => {
  test.each([{ ip: '192.168.0.3', netmask: '255.255.254.0', expected: '192.168.1.255' }])(
    'getBroadcastAddr($netmask, $ip) === $expect',
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
