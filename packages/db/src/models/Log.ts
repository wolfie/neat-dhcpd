import type { Database } from './types';
import type { InsertObject } from 'kysely';
import db from '../db';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

type zLogLevel = z.TypeOf<typeof zLogLevel>;
const zLogLevel = z.union([z.literal('log'), z.literal('error'), z.literal('debug')]);

const insert = (values: InsertObject<Database, 'log'>) =>
  db.insertInto('log').values(values).execute();
const get = ({ offset, limit }: { offset: number; limit: number }) =>
  db.selectFrom('log').orderBy('timestamp desc').offset(offset).limit(limit).selectAll().execute();

export default router({
  insert: publicProcedure
    .input(
      z.object({
        system: z.string(),
        level: zLogLevel,
        json: z.unknown(),
      })
    )
    .mutation(async (ctx) => {
      const { level, system, json } = ctx.input;
      await insert({ level, system, json: JSON.stringify(json) });
    }),
  get: publicProcedure
    .input(z.object({ offset: z.number(), limit: z.number() }))
    .query((ctx) => get(ctx.input)),
});
