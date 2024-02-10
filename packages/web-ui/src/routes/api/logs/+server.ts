import { startTraceRoot } from '@neat-dhcpd/litel';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import getLogs, { type Log } from '$lib/server/getLogs';

export type LogsGetResponse = Log[];
export const GET: RequestHandler = async () => {
  const trace = startTraceRoot('/api/logs:GET');
  return getLogs(trace)
    .then(json)
    .finally(() => trace.end());
};
