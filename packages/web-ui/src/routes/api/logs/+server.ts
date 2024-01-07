import trpc from '$lib/server/trpcClient';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => trpc.logsGet.query({ limit: 50, offset: 0 }).then(json);
