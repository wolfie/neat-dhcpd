import type { Trace } from '@neat-dhcpd/litel';
import trpc from './trpcClient';

export type Log = Awaited<ReturnType<typeof getLogs>>[number];
const getLogs = (parentTrace: Trace) => {
  const trace = parentTrace.startSubTrace('getLogs');
  return trpc.log.get
    .query({
      limit: 50,
      offset: 0,
      remoteTracingId: trace.id,
    })
    .finally(() => trace.end());
};

export default getLogs;
