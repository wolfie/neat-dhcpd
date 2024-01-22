import type { RawBuilder } from 'kysely';
import { sql } from 'kysely';
import db from '../db';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

export type zLogLevel = z.TypeOf<typeof zLogLevel>;
export const zLogLevel = z.union([z.literal('log'), z.literal('error'), z.literal('debug')]);

const LOG_LEVELS: Record<zLogLevel, RawBuilder<unknown>> = {
  error: sql.raw("'error'"),
  log: sql.raw("'error', 'info'"),
  debug: sql.raw("'error', 'info', 'debug'"),
};

const InsertInput = z.object({ level: zLogLevel, system: z.string(), json: z.string() });
type InsertInput = z.TypeOf<typeof InsertInput>;
const insert = (values: InsertInput) =>
  sql`
  INSERT INTO ${sql.table('log')} (level, system, json) 
  SELECT ${sql.val(values.level)}, ${sql.val(values.system)}, ${sql.val(values.json)}
  WHERE (SELECT log_level FROM ${sql.table('config')}) IN (${LOG_LEVELS[values.level]})
  `.execute(db);
const get = ({ offset, limit }: { offset: number; limit: number }) =>
  db.selectFrom('log').orderBy('timestamp desc').offset(offset).limit(limit).selectAll().execute();

const logRouter = router({
  insert: publicProcedure.input(InsertInput).mutation(async (ctx) => {
    const { level, system, json } = ctx.input;
    await insert({ level, system, json: JSON.stringify(json) });
  }),
  get: publicProcedure
    .input(z.object({ offset: z.number(), limit: z.number() }))
    .query((ctx) =>
      get(ctx.input).then((logs) =>
        logs.map((log) => ({ ...log, level: zLogLevel.parse(log.level) }))
      )
    ),
});

export default logRouter;
