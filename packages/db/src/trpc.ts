import { TRPCError, initTRPC } from '@trpc/server';
import { z } from 'zod';
import zTraceId from './lib/zTraceId.js';
import type { Trace } from '@neat-dhcpd/litel';
import { startTraceRootFromRemote } from '@neat-dhcpd/litel';

const t = initTRPC.context<{ trace: Trace | undefined }>().create();

const zTracing = z.object({
  remoteTracing: z
    .object({
      parentId: zTraceId,
      system: z.union([z.literal('dhcpd'), z.literal('db'), z.literal('web-ui')]),
    })
    .optional(),
});

type ZTracing = typeof zTracing;

export function WithTraceId(): z.ZodOptional<ZTracing>;
export function WithTraceId<T extends z.ZodObject<z.ZodRawShape>>(
  obj: T
): z.ZodIntersection<ZTracing, T>;
export function WithTraceId(obj?: z.ZodObject<z.ZodRawShape>) {
  return obj ? z.intersection(zTracing, obj) : zTracing.optional();
}

const UnkonwnWithTraceId = WithTraceId();

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
  if (inputParse.success && inputParse.data?.remoteTracing)
    trace = startTraceRootFromRemote(path, inputParse.data.remoteTracing);

  return next({ ctx: { trace } }).finally(() => trace?.end());
});
