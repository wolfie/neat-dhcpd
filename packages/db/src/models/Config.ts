import type { InsertObject } from 'kysely';
import type { Database } from './types';
import db from '../db';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import zIpString from '../lib/zIpString';

const Config = z.object({
  ip_start: zIpString,
  ip_end: zIpString,
  lease_time_minutes: z.number().int(),
  gateway_ip: zIpString,
  dns1: zIpString,
  dns2: z.nullable(zIpString),
  dns3: z.nullable(zIpString),
  dns4: z.nullable(zIpString),
  send_replies: z.boolean().transform((b) => (b ? 1 : 0)),
  broadcast_cidr: z.nullable(z.string()),
});

const set = async (values: InsertObject<Database, 'config'>) => {
  await db.deleteFrom('config').execute();
  await db.insertInto('config').values(values).execute();
};
const get = () => db.selectFrom('config').selectAll().executeTakeFirst();

export default router({
  set: publicProcedure.input(Config).mutation((ctx) => set(ctx.input)),
  get: publicProcedure.query(get),
});
