import type { Ip, IpString } from '@neat-dhcpd/common';
import { ipFromNumber, ipFromString } from '@neat-dhcpd/common';
import type { Config } from '@neat-dhcpd/db';
import rand from './rand.js';
import trpc from '../trpcClient.js';
import type { Trace } from '@neat-dhcpd/litel';
import uniq from './uniq.js';

const findFreeIp = async (
  requestedAddress: { mac: string; ip: Ip } | undefined,
  config: Config,
  parentTrace: Trace
) => {
  const trace = parentTrace.startSubTrace('findFreeIp');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const ipStartN = ipFromString(config.ip_start);
    const ipEndN = ipFromString(config.ip_end);
    if (!ipStartN || !ipEndN) {
      return 'malformatted-ip-start-or-end' as const;
    }

    const { getReservedIpForMac, unavailableIpNumbers } = await Promise.all([
      trpc.reservedIp.getAll.query({ remoteTracingId: trace.id }),
      trpc.lease.getAll.query({ remoteTracingId: trace.id }),
      trpc.offer.getAll.query({ remoteTracingId: trace.id }),
    ]).then(([reservedIps, leasedIps, offeredIps]) => {
      const matchingMac =
        (macToFind: string) =>
        ({ mac }: { mac: string }) =>
          mac === macToFind;

      return {
        getReservedIpForMac: (mac: string): { ip: IpString; mac: string } | undefined =>
          reservedIps.find(matchingMac(mac)) ??
          leasedIps.find(matchingMac(mac)) ??
          offeredIps.find(matchingMac(mac)),
        unavailableIpNumbers: uniq(
          [...reservedIps, ...leasedIps, ...offeredIps].map(({ ip }) => ipFromString(ip).num)
        ),
      };
    });

    if (requestedAddress) {
      const reservedForThisClient = getReservedIpForMac(requestedAddress.mac);
      if (reservedForThisClient) {
        return ipFromString(reservedForThisClient.ip);
      }
    }

    // TODO This stops working if there are a lot of assigned IPs in a big IP range.
    // Instead, create a list of valid ips and pick one randomly.
    let candidate = rand(ipStartN.num, ipEndN.num);
    let triesLeft = 5000;
    for (; triesLeft > 0; triesLeft--) {
      candidate = rand(ipStartN.num, ipEndN.num);
      if (!unavailableIpNumbers.includes(candidate)) break;
    }
    if (triesLeft <= 0) {
      return 'no-ips-left' as const;
    }
    return ipFromNumber(candidate);
  } finally {
    trace.end();
  }
};

export default findFreeIp;
