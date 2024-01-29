import type { Trace } from '@neat-dhcpd/litel';
import getSeenMacs from './getSeenMacs';
import trpc from './trpcClient';

export type PolledData = Awaited<ReturnType<typeof getPolledData>>;
const getPolledData = async (parentTrace: Trace) => {
  const trace = parentTrace.startSubTrace('getPolledData');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const [seenMacs, logs, leases, offers] = await Promise.all([
      getSeenMacs(trace),
      trpc.log.get.query({
        limit: 50,
        offset: 0,
        remoteTracing: { parentId: trace.id, system: trace.system },
      }),
      trpc.lease.getAll.query({ remoteTracing: { parentId: trace.id, system: trace.system } }),
      trpc.offer.getAll.query({ remoteTracing: { parentId: trace.id, system: trace.system } }),
    ]);

    return { seenMacs, logs, leases, offers };
  } finally {
    trace.end();
  }
};

export default getPolledData;
