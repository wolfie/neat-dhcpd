import trpc from '$lib/server/trpcClient';
import { startTraceRoot } from '@neat-dhcpd/litel';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const trace = startTraceRoot('/api/logs:GET');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const logs = await trpc.log.get.query({
      limit: 50,
      offset: 0,
      remoteTracing: { parentId: trace.id, system: trace.system },
    });
    return json(logs);
  } finally {
    trace.end();
  }
};
