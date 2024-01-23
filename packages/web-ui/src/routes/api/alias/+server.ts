import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import z from 'zod';
import trpc from '$lib/server/trpcClient';

const AliasPutBody = z.object({ mac: z.string(), alias: z.string() });
export type AliasPutBody = z.TypeOf<typeof AliasPutBody>;

export const PUT: RequestHandler = async ({ request }) => {
  const body = await request.json().then(AliasPutBody.parse);

  if (body.alias) {
    trpc.alias.set.mutate(body);
  } else {
    trpc.alias.delete.mutate({ mac: body.mac });
  }

  return json({ ok: true });
};
