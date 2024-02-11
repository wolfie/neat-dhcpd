/* eslint-disable functional/no-try-statements */
/* eslint-disable functional/no-throw-statements */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { v4 as uuid } from 'uuid';
import { partition } from './lib/partition.js';
import { consume } from './client.js';
import { z } from 'zod';
import isEnabled from './isEnabled.js';

// TODO rewrite code so that a crash does not leave the entire queue unsent.
// The receiving end should help with merging the durations.
// - Maybe always send always unfinished spans, and then patch the durations later
// - And if they haven't been sent yet, just append the objects.

const System = z.union([z.literal('db'), z.literal('dhcpd'), z.literal('web-ui')]);
export type System = z.TypeOf<typeof System>;

let unsentTracesQueue: TraceStub[] = [];

let currentSystem = System.optional().parse(process.env.LITEL_SYSTEM);
export const setCurrentSystem = (system: System) => (currentSystem = system);

// TODO a checker that there aren't long-lived unsent traces (more than couple minutes?)
let senderTimeout: NodeJS.Timeout | undefined = undefined;
const scheduleSender = () => {
  if (senderTimeout || unsentTracesQueue.length === 0) return;

  senderTimeout = setTimeout(() => {
    const { pass: tracesToSend, fail: remainingUnsentTraceQueue } = partition(
      unsentTracesQueue,
      (trace) => trace.duration.length > 1
    );

    if (tracesToSend.length > 0) {
      tracesToSend.forEach(consume);
      unsentTracesQueue = remainingUnsentTraceQueue;
    }
    senderTimeout = undefined;
    scheduleSender();
  }, 1000);
};

export type TraceId = `${string}:trace-id`;
export const isTraceId = (x: unknown): x is TraceId =>
  typeof x === 'string' && x.endsWith(':trace-id');

export type Trace = {
  id: TraceId;
  name: string;
  parentId: TraceId | null;
  remoteParentId?: TraceId;
  system: System;
  start: number;
  duration: [start: bigint] | [start: bigint, end: bigint, total: bigint];
  startSubTrace: (name: string) => Readonly<Trace>;
  wrapCall: <FN extends (...args: any[]) => any>(fn: FN) => FN;
  end: () => void;
};
export type TraceStub = Omit<Trace, 'startSubTrace' | 'wrapCall' | 'end'>;

const getNullTrace = (): Trace => ({
  id: 'null:trace-id',
  name: '__NULL-TRACE',
  duration: [0n],
  parentId: null,
  start: 0,
  system: '__INTERNAL' as any,
  wrapCall: (fn) => fn,
  startSubTrace: () => getNullTrace(),
  end: () => undefined,
});

const getCurrentSystem = () => {
  if (!currentSystem) {
    throw new Error('Call `setCurrentSystem` before creating any traces');
  }
  return currentSystem;
};

const createTrace = (
  name: string,
  parentId: TraceId | null,
  remoteParentId?: TraceId
): Readonly<Trace> => {
  if (!isEnabled()) return getNullTrace();

  const trace = {
    id: `${uuid()}:trace-id`,
    name,
    parentId,
    start: Date.now(),
    duration: [process.hrtime.bigint()],
    system: getCurrentSystem(),
    remoteParentId,
  } satisfies TraceStub;

  unsentTracesQueue.push(trace);

  const startSubTrace: Trace['startSubTrace'] = (name) =>
    createTrace(name, trace.id, remoteParentId);

  const wrapCall: Trace['wrapCall'] = (fn) => {
    const wrappedFn = (...args: Parameters<typeof fn>) => {
      const subTrace = startSubTrace(fn.name ?? '__unknownInlineFunction');
      let endIsHandled = false;
      try {
        const result = fn(...args);

        if ('then' in result) {
          endIsHandled = true;
          if ('finally' in result) {
            return result.finally(() => {
              subTrace.end();
            }) as ReturnType<typeof fn>;
          } else {
            return result.then((res: any) => {
              subTrace.end();
              return res;
            }) as ReturnType<typeof fn>;
          }
        } else {
          return result as ReturnType<typeof fn>;
        }
      } finally {
        if (!endIsHandled) subTrace.end();
      }
    };

    return Object.assign(wrappedFn, fn);
  };

  const end: Trace['end'] = () => {
    const endTime = process.hrtime.bigint();
    const duration = endTime - trace.duration[0];
    trace.duration.push(endTime, duration);

    // TODO also send partial traces
    if (trace.parentId === null) scheduleSender();
  };

  return {
    ...trace,
    startSubTrace,
    wrapCall,
    end,
  };
};

export const startTraceRoot = (name: string): Readonly<Trace> => createTrace(name, null, undefined);

export const startTraceRootFromRemote = (name: string, remoteParentId: TraceId): Readonly<Trace> =>
  createTrace(name, null, remoteParentId);
