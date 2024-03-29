import type { TraceId } from '@neat-dhcpd/litel';
import trpc from '../trpcClient.js';

const log = (level: 'error' | 'log' | 'debug', json: unknown, parentTraceId?: TraceId) => {
  const logEntry = { system: 'dhcpd', level, json };
  console.log('[%s] %j', new Date().toISOString(), logEntry);
  trpc.log.insert.mutate(
    parentTraceId ? { ...logEntry, remoteTracingId: parentTraceId } : logEntry
  );
};

export default log;
