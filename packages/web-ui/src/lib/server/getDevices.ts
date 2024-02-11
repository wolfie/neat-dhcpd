import type { Trace } from '@neat-dhcpd/litel';
import trpc from './trpcClient';
import getMacVendor from './getMacVendor';

export type Device = Awaited<ReturnType<typeof getDevices>>[number];

const getDevices = (parentTrace: Trace) => {
  const trace = parentTrace.startSubTrace('getDevices');
  return trpc.aggregate.getAll
    .query({
      remoteTracingId: trace.id,
    })
    .then((devices) =>
      devices.map((d) => ({
        ...d,
        mac: { address: d.mac, vendor: getMacVendor(d.mac) },
      }))
    )
    .finally(() => trace.end());
};

export default getDevices;
