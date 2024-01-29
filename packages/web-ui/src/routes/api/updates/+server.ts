import getPolledData from '$lib/server/getPolledData';
import { startTraceRoot } from '@neat-dhcpd/litel';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
  const trace = startTraceRoot('/api/updates:GET');
  return getPolledData(trace)
    .then(json)
    .finally(() => trace.end());
};
