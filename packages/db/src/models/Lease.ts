import { z } from 'zod';
import db from '../db';
import CURRENT_TIMESTAMP_WITH_MILLIS from '../lib/currentTimestamp';
import { publicProcedure, router } from '../trpc';

const getAll = () =>
  db
    .selectFrom('lease')
    .where('expires_at', '<', CURRENT_TIMESTAMP_WITH_MILLIS)
    .selectAll()
    .execute();
const get = ({ mac }: { mac: string }) =>
  db
    .selectFrom('lease')
    .where('expires_at', '<', CURRENT_TIMESTAMP_WITH_MILLIS)
    .where('mac', '=', mac)
    .selectAll()
    .executeTakeFirst();

export default router({
  getAll: publicProcedure.query(getAll),
  get: publicProcedure.input(z.object({ mac: z.string() })).query((ctx) => get(ctx.input)),
});
