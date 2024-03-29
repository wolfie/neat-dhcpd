import type { InsertObject } from 'kysely';
import type { Database } from './types.js';
import db from '../db.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import { z } from 'zod';
import zIpString from '../lib/zIpString.js';
import { zLogLevel } from './Log.js';
import passInputWithoutTracing from '../lib/passInput.js';

const Config = z.object({
  ip_start: zIpString,
  ip_end: zIpString,
  lease_time_minutes: z.number().int(),
  gateway_ip: zIpString,
  send_replies: z.boolean().transform((b) => (b ? 1 : 0)),
  broadcast_cidr: z.nullable(z.string()),
  log_level: zLogLevel,
});

const set = async (values: InsertObject<Database, 'config'>) => {
  await db.deleteFrom('config').execute();
  await db.insertInto('config').values(values).execute();
};
const get = () =>
  db
    .selectFrom('config')
    .selectAll()
    .executeTakeFirst()
    .then(
      (result) => result && Config.parse({ ...result, send_replies: Boolean(result.send_replies) })
    );

const configRouter = router({
  set: publicProcedure.input(WithTraceId(Config)).mutation(passInputWithoutTracing(set)),
  get: publicProcedure.input(WithTraceId()).query(get),
});

export default configRouter;
