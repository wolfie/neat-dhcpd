import { text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => text(process.env.GIT_COMMIT_SHA || 'Unknown SHA');
