import trpc from '../trpcClient';

const log = (level: 'error' | 'log' | 'debug', json: unknown) => {
  const logEntry = { system: 'dhcpd', level, json };
  console.log('[%s] %j', new Date().toISOString(), logEntry);
  trpc.log.insert.mutate({ ...logEntry, json: JSON.stringify(json) });
};

export default log;
