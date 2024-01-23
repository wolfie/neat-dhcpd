import { TRPCError, initTRPC } from '@trpc/server';
import { z } from 'zod';
import zTraceId from './lib/zTraceId.js';
import type { Trace, System, TraceId } from '@neat-dhcpd/litel';
import { startTraceRootFromRemote } from '@neat-dhcpd/litel';

const t = initTRPC.context<{ trace: Trace | undefined }>().create();

export const WithTraceId = <T extends z.ZodObject<z.ZodRawShape>>(obj: T) =>
  z.intersection(
    z.object({
      remoteTracing: z
        .object({
          parentId: zTraceId,
          system: z.union([z.literal('dhcpd'), z.literal('db'), z.literal('web-ui')]),
        })
        .optional(),
    }),
    obj
  );

const UnkonwnWithTraceId = WithTraceId(z.object({}));

type WithTraceId<T extends object = Record<never, unknown>> = T & {
  remoteTracing?: { parentId: TraceId; system: System };
};

export const router = t.router;
export const publicProcedure = t.procedure.use(({ next, path, rawInput, ctx }) => {
  if (ctx.trace) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected `trace` already in ctx',
    });
  }

  const inputParse = UnkonwnWithTraceId.safeParse(rawInput);
  let trace: Trace | undefined = undefined;
  if (inputParse.success && inputParse.data.remoteTracing)
    trace = startTraceRootFromRemote(path, inputParse.data.remoteTracing);

  return next({ ctx: { trace } }).finally(() => trace?.end());
});
