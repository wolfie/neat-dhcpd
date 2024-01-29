import type { Ip } from '@neat-dhcpd/common';
import { ipFromNumber, ipFromString } from '@neat-dhcpd/common';
import type { Config } from '@neat-dhcpd/db';
import rand from './rand.js';
import trpc from '../trpcClient.js';
import type { Trace } from '@neat-dhcpd/litel';

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

    const reservedIps = await Promise.all([
      trpc.lease.getAll
        .query({ remoteTracing: { parentId: trace.id, system: trace.system } })
        .then((leases) => leases.map((l) => ({ mac: l.mac, ip: l.ip }))),
      trpc.offer.getAll
        .query({ remoteTracing: { parentId: trace.id, system: trace.system } })
        .then((offers) => offers.map((o) => ({ mac: o.mac, ip: o.ip }))),
    ]).then(([leases, offers]) => leases.concat(offers));

    if (
      requestedAddress &&
      ipStartN.num <= requestedAddress.ip.num &&
      requestedAddress.ip.num <= ipEndN.num
    ) {
      const occupiedLease = reservedIps.find((l) => l.ip === requestedAddress.ip.str);
      if (!occupiedLease || occupiedLease.mac === requestedAddress.mac) {
        return requestedAddress.ip;
      }
    }

    const reservedIpNs = reservedIps.map((l) => ipFromString(l.ip).num);

    let candidate = rand(ipFromString('169.254.0.0').num, ipFromString('169.254.255.255').num);
    let triesLeft = 5000;
    for (; triesLeft > 0; triesLeft--) {
      candidate = rand(ipStartN.num, ipEndN.num);
      if (!reservedIpNs.includes(candidate)) break;
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
