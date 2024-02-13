import { startTraceRoot } from '@neat-dhcpd/litel';
import type { RequestHandler } from './$types';
import trpc from '$lib/server/trpcClient';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async () => {
  const trace = startTraceRoot('/api/clear-logs:POST');
  return trpc.log.clearBefore
    .mutate({ magnitude: 'days', unit: 1, remoteTracingId: trace.id })
    .then(() => json({ ok: true }))
    .finally(() => trace.end());
};
