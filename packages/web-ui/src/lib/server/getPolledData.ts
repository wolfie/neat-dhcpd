import type { Trace } from '@neat-dhcpd/litel';
import getSeenMacs from './getSeenMacs';
import trpc from './trpcClient';
import type { MacVendor } from './getMacVendor';
import type { IpString } from '@neat-dhcpd/common';

export type Device = {
  mac: { address: string; vendor: MacVendor | undefined };
  alias: string | undefined;
  firstSeen: string;
  lastSeen: string;
  hostname: string | undefined;
  offer: IpString | undefined;
  lease: IpString | undefined;
};

export type PolledData = Awaited<ReturnType<typeof getPolledData>>;
const getPolledData = async (parentTrace: Trace) => {
  const trace = parentTrace.startSubTrace('getPolledData');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const [seenMacs, logs, leases, offers] = await Promise.all([
      getSeenMacs(trace),
      trpc.log.get.query({
        limit: 50,
        offset: 0,
        remoteTracing: { parentId: trace.id, system: trace.system },
      }),
      trpc.lease.getAll.query({ remoteTracing: { parentId: trace.id, system: trace.system } }),
      trpc.offer.getAll.query({ remoteTracing: { parentId: trace.id, system: trace.system } }),
    ]);

    const devices = seenMacs.map<Device>((seenMac) => {
      return {
        mac: {
          address: seenMac.mac,
          vendor: seenMac.vendor,
        },
        alias: seenMac.alias ?? undefined,
        firstSeen: seenMac.first_seen,
        lastSeen: seenMac.last_seen,
        hostname: seenMac.hostname ?? undefined,
        offer: offers.find((o) => o.mac === seenMac.mac)?.ip,
        lease: leases.find((l) => l.mac === seenMac.mac)?.ip,
      };
    });

    return { logs, devices };
  } finally {
    trace.end();
  }
};

export default getPolledData;
