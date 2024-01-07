import Log from '../models/Log';

type LogLevel = 'log' | 'error' | 'debug';

let enableLogging = true;

export const __disableLogging = () => (enableLogging = false);

const log = async ({ level, system, json }: { system: string; level: LogLevel; json: unknown }) => {
  if (!enableLogging) return;
  await Log.insert({ level, system, json: JSON.stringify(json) });
};

export default log;
