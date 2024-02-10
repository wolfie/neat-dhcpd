import { startTraceRoot } from '@neat-dhcpd/litel';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import getDevices from '$lib/server/getDevices';

export type DevicesGetResponse = Awaited<ReturnType<typeof getDevices>>;

export const GET: RequestHandler = async () => {
  const trace = startTraceRoot('/api/devices:GET');
  return getDevices(trace)
    .then(json)
    .finally(() => trace.end());
};
