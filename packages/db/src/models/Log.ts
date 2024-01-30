import type { RawBuilder } from 'kysely';
import { sql } from 'kysely';
import db from '../db.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import { z } from 'zod';
import passInputWithoutTracing from '../lib/passInput.js';

export type zLogLevel = z.TypeOf<typeof zLogLevel>;
export const zLogLevel = z.union([z.literal('log'), z.literal('error'), z.literal('debug')]);

const LOG_LEVELS: Record<zLogLevel, RawBuilder<unknown>> = {
  error: sql.raw("'error'"),
  log: sql.raw("'error', 'log'"),
  debug: sql.raw("'error', 'log', 'debug'"),
};

const InsertInput = z.object({ level: zLogLevel, system: z.string(), json: z.unknown() });
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
  insert: publicProcedure.input(WithTraceId(InsertInput)).mutation(
    passInputWithoutTracing(async ({ level, system, json }) => {
      await insert({ level, system, json: JSON.stringify(json) });
    })
  ),
  get: publicProcedure
    .input(WithTraceId(z.object({ offset: z.number(), limit: z.number() })))
    .query(
      passInputWithoutTracing((input) =>
        get(input).then((logs) =>
          logs.map((log) => ({ ...log, level: zLogLevel.parse(log.level) }))
        )
      )
    ),
});

export default logRouter;
