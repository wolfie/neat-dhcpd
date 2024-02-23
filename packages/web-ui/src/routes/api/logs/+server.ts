import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import getLogs, { type Log } from '$lib/server/getLogs';

export type LogsGetResponse = Log[];
export const GET: RequestHandler = async () => {
  return getLogs().then(json);
};
