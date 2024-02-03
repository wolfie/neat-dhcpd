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
        remoteTracing: { parentId: trace.id, system: trace.system },
      });
    } else {
      await trpc.alias.delete.mutate({
        mac: body.mac,
        remoteTracing: { parentId: trace.id, system: trace.system },
      });
    }

    return json({ ok: true });
  } finally {
    trace.end();
  }
};
