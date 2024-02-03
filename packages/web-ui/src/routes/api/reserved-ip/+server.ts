import { isIpString } from '@neat-dhcpd/common';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { startTraceRoot } from '@neat-dhcpd/litel';
import trpc from '$lib/server/trpcClient';
import { json } from '@sveltejs/kit';

const ReservedIpPutBody = z.object({
  mac: z.string(),
  reservedIp: z.union([z.string().refine(isIpString), z.literal('')]),
});
export type ReservedIpPutBody = z.TypeOf<typeof ReservedIpPutBody>;

export const PUT: RequestHandler = async ({ request }) => {
  const trace = startTraceRoot('/api/reserved-ip:PUT');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const body = await request.json().then(ReservedIpPutBody.parse);

    if (body.reservedIp) {
      await trpc.reservedIp.add.mutate({
        mac: body.mac,
        ip: body.reservedIp,
        remoteTracing: { parentId: trace.id, system: trace.system },
      });
    } else {
      await trpc.reservedIp.delete.mutate({
        mac: body.mac,
        remoteTracing: { parentId: trace.id, system: trace.system },
      });
    }

    return json({ ok: true });
  } finally {
    trace.end();
  }
};
