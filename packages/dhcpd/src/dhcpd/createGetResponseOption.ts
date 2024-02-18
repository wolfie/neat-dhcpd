import type { Config } from '@neat-dhcpd/db';
import type { Address } from './createResponse.js';
import type { IpString } from '@neat-dhcpd/common';
import { getBroadcastAddr, ipFromString } from '@neat-dhcpd/common';
import log from '../lib/log.js';
import trpc from '../trpcClient.js';
import type { Trace } from '@neat-dhcpd/litel';

const DOMAIN_NAME_SERVER = 6;

const createGetResponseOption =
  (serverAddress: Address, config: Config, parentTrace: Trace) =>
  async (id: number): Promise<Uint8Array | undefined> => {
    switch (id) {
      case 1:
        return serverAddress.netmask.buf;
      case 3:
        return ipFromString(config.gateway_ip)?.buf;
      case DOMAIN_NAME_SERVER:
        using _trace = parentTrace.startSubTrace('createGetResponseOption:DOMAIN_NAME_SERVER');
        const dnsServerIps = (await trpc.dhcpOption.get.query({
          option: DOMAIN_NAME_SERVER,
        })) as undefined | IpString[];
        return dnsServerIps
          ? Buffer.concat(dnsServerIps.map((ipString) => ipFromString(ipString).buf))
          : Buffer.alloc(0);
      case 15:
        return Buffer.from('local', 'ascii'); // TODO
      case 28:
        const ip_start = ipFromString(config.ip_start);
        if (!ip_start) {
          log('error', { message: 'ip_start is not a valid ip', config });
          return undefined;
        }
        return getBroadcastAddr(serverAddress.netmask, ip_start).buf;
    }
    return undefined;
  };

export default createGetResponseOption;
