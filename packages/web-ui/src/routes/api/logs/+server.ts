import trpc from '$lib/server/trpcClient';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => trpc.log.get.query({ limit: 50, offset: 0 }).then(json);
