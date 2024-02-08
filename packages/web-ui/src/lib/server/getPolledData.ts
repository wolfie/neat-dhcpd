import type { Trace } from '@neat-dhcpd/litel';
import trpc from './trpcClient';
import type { MacVendor } from './getMacVendor';
import type { IpString } from '@neat-dhcpd/common';
import getMacVendor from './getMacVendor';

export type Device = {
  mac: { address: string; vendor: MacVendor | undefined };
  alias: string | undefined;
  firstSeen: string;
  lastSeen: string;
  hostname: string | undefined;
  offer: IpString | undefined;
  lease: IpString | undefined;
  reservedIp: IpString | undefined;
};

type $Device2 = Awaited<ReturnType<typeof trpc.aggregate.getAll.query>>[number];
export type Device2 = Omit<$Device2, 'mac'> & {
  mac: { address: string; vendor: MacVendor | undefined };
};

export type PolledData = Awaited<ReturnType<typeof getPolledData>>;
const getPolledData = async (parentTrace: Trace) => {
  const trace = parentTrace.startSubTrace('getPolledData');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const [logs, _devices] = await Promise.all([
      trpc.log.get.query({
        limit: 50,
        offset: 0,
        remoteTracing: { parentId: trace.id, system: trace.system },
      }),
      trpc.aggregate.getAll.query({ remoteTracing: { parentId: trace.id, system: trace.system } }),
    ]);

    const devices = _devices.map((d) => ({
      ...d,
      mac: { address: d.mac, vendor: getMacVendor(d.mac) },
    }));

    return { logs, devices: devices satisfies Device2[] };
  } finally {
    trace.end();
  }
};

export default getPolledData;
