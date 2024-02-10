import trpc from '$lib/server/trpcClient';
import { startTraceRoot } from '@neat-dhcpd/litel';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import getMacVendor from '$lib/server/getMacVendor';

export type DevicesGetResponse = Array<ReturnType<typeof mapDevice>>;

const mapDevice = (device: Awaited<ReturnType<typeof trpc.aggregate.getAll.query>>[number]) => ({
  ...device,
  mac: { address: device.mac, vendor: getMacVendor(device.mac) },
});

export const GET: RequestHandler = async () => {
  const trace = startTraceRoot('/api/devices:GET');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const devices = await trpc.aggregate.getAll
      .query({
        remoteTracing: { parentId: trace.id, system: trace.system },
      })
      .then((devices) =>
        devices.map((d) => ({
          ...d,
          mac: { address: d.mac, vendor: getMacVendor(d.mac) },
        }))
      );

    return json(devices);
  } finally {
    trace.end();
  }
};
