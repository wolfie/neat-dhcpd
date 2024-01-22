import getPolledData from '$lib/server/getPolledData';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => getPolledData().then(json);
