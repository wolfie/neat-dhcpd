import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import z from 'zod';
import trpc from '$lib/server/trpcClient';
import { startTraceRoot } from '@neat-dhcpd/litel';

const AliasPutBody = z.object({ mac: z.string(), alias: z.string() });
export type AliasPutBody = z.TypeOf<typeof AliasPutBody>;

export const PUT: RequestHandler = async ({ request }) => {
  const trace = startTraceRoot('/api/alias:PUT');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const body = await request.json().then(AliasPutBody.parse);

    if (body.alias) {
      await trpc.alias.set.mutate({
        ...body,
        remoteTracingId: trace.id,
      });
    } else {
      await trpc.alias.delete.mutate({
        mac: body.mac,
        remoteTracingId: trace.id,
      });
    }

    return json({ ok: true });
  } finally {
    trace.end();
  }
};
