import getSeenMacs from './getSeenMacs';
import trpc from './trpcClient';

export type PolledData = Awaited<ReturnType<typeof getPolledData>>;
const getPolledData = async () => {
  const [seenMacs, logs, leases, offers] = await Promise.all([
    getSeenMacs(),
    trpc.log.get.query({ limit: 50, offset: 0 }),
    trpc.lease.getAll.query(),
    trpc.offer.getAll.query(),
  ]);

  return { seenMacs, logs, leases, offers };
};

export default getPolledData;
