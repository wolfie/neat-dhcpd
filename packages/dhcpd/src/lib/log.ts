import trpc from '../trpcClient';

const log = (level: 'error' | 'log' | 'debug', json: unknown) => {
  const logEntry = { system: 'dhcpd', level, json };
  console.log('[%s] %j', new Date().toISOString(), logEntry);
  trpc.logAdd.mutate(logEntry);
};

export default log;
