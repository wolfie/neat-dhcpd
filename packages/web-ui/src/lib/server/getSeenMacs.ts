import type { Trace } from '@neat-dhcpd/litel';
import getMacVendor from './getMacVendor';
import trpc from './trpcClient';

const getSeenMacs = async (parentTrace: Trace) => {
  const trace = parentTrace.startSubTrace('getSeenMacs');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const seenMacs = await trpc.seenMac.getAll.query({
      remoteTracing: { parentId: trace.id, system: trace.system },
    });
    return seenMacs.map((seenMac) => ({
      ...seenMac,
      vendor: getMacVendor(seenMac.mac),
    }));
  } finally {
    trace.end();
  }
};

export default getSeenMacs;
