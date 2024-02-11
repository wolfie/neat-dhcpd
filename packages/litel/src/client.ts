/* eslint-disable functional/no-throw-statements */
import type { Socket } from 'net';
import { createConnection } from 'net';
import partition from './lib/partition.js';
import * as SuperJSON from 'superjson';
import type { TraceStub } from './index.js';
import isEnabled from './isEnabled.js';

const PORT = 12345;
const MAX_RETRIES = 5;
const RETRY_SLEEP_MS = 1000;

const getClient = (retries = 0): Promise<Socket> => {
  if (!isEnabled()) throw new Error('Unexpected client created, even though litel is not enabled');
  return new Promise<Socket>((resolve, reject) => {
    const socket: Socket = createConnection(PORT, undefined, () => resolve(socket));
    socket.on('error', async (e) => {
      if (
        retries < MAX_RETRIES &&
        'code' in e &&
        ['ETIMEDOUT', 'ECONNREFUSED'].includes(e.code as string)
      ) {
        console.log('could not connect to litel server, retrying soon...');
        setTimeout(() => {
          console.log('...retrying now');
          getClient(retries + 1).then((socket) => {
            console.log('GOT IT!');
            resolve(socket);
          });
        }, RETRY_SLEEP_MS);
      } else reject(e);
    });
  });
};
let unhandledTraces: TraceStub[] = [];

export type HierarchicalTrace = TraceStub & { children: HierarchicalTrace[] };

const makeHierarchical = <T extends TraceStub>(trace: T): T & HierarchicalTrace => ({
  ...trace,
  children: unhandledTraces.filter((s) => s.parentId === trace.id).map(makeHierarchical),
});

const findTree = (trace: TraceStub): TraceStub[] => {
  const children = unhandledTraces.filter((child) => child.parentId === trace.id);
  return [trace, ...children.flatMap(findTree)];
};

const cleanup = (trace: TraceStub) => {
  const idToCleanUp = findTree(trace).map((trace) => trace.id);
  const { fail } = partition(unhandledTraces, (unhandledTrace) =>
    idToCleanUp.includes(unhandledTrace.id)
  );
  unhandledTraces = fail;
};

const output = (rootTrace: HierarchicalTrace) => {
  getClient().then((socket) => {
    socket.write(SuperJSON.stringify(rootTrace));
    socket.end();
    setTimeout(() => cleanup(rootTrace), 500);
  });
};

export const consume = (trace: TraceStub) => {
  unhandledTraces.push(trace);

  if (trace.parentId === null) {
    setTimeout(() => output(makeHierarchical(trace)), 1000);
  }
};
