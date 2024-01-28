import db from '../db.js';
import { CURRENT_TIMESTAMP_WITH_MILLIS, timestampAfter } from '../lib/sqlTimestamps.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import { z } from 'zod';
import zIpString from '../lib/zIpString.js';

const DEFAULT_OFFER_DURATION_MINS = 5;

// TODO run only if an offer has been added within the last DEFAULT_OFFER_DURATION_MINS
setInterval(async () => {
  db.deleteFrom('offer')
    .where('expires_at', '<', CURRENT_TIMESTAMP_WITH_MILLIS)
    .execute()
    .then((result) => result.reduce((sum, r) => sum + r.numDeletedRows, 0n))
    .then((deletedRows) => {
      if (deletedRows === 0n) return;
      console.log(`Cleaned up ${deletedRows} expired offers`);
    });
}, DEFAULT_OFFER_DURATION_MINS * 60_000);

const getAll = () =>
  db
    .selectFrom('offer')
    .where('expires_at', '>', CURRENT_TIMESTAMP_WITH_MILLIS)
    .selectAll()
    .execute();

const GetInput = z.object({ mac: z.string() });
type GetInput = z.TypeOf<typeof GetInput>;
const get = ({ mac }: GetInput) =>
  db
    .selectFrom('offer')
    .where('mac', '=', mac)
    .where('expires_at', '>', CURRENT_TIMESTAMP_WITH_MILLIS)
    .selectAll()
    .executeTakeFirst();

const AddInput = z.object({ mac: z.string(), ip: zIpString, lease_time_secs: z.number().int() });
type AddInput = z.TypeOf<typeof AddInput>;
const add = ({ mac, ip, lease_time_secs }: AddInput) =>
  db
    .insertInto('offer')
    .values({
      mac,
      ip,
      expires_at: timestampAfter(DEFAULT_OFFER_DURATION_MINS, 'minutes'),
      lease_time_secs,
    })
    .onConflict((oc) => oc.column('mac').doUpdateSet({ ip, lease_time_secs }))
    .execute()
    .then(() => undefined);

const DeleteInput = z.object({ mac: z.string() });
type DeleteInput = z.TypeOf<typeof DeleteInput>;
const del = ({ mac }: DeleteInput) =>
  db
    .deleteFrom('offer')
    .where('mac', '=', mac)
    .execute()
    .then(() => undefined);

const offerRouter = router({
  getAll: publicProcedure.input(WithTraceId()).query(getAll),
  get: publicProcedure.input(WithTraceId(GetInput)).query((ctx) => get(ctx.input)),
  add: publicProcedure.input(WithTraceId(AddInput)).mutation((ctx) => add(ctx.input)),
  delete: publicProcedure.input(WithTraceId(DeleteInput)).mutation((ctx) => del(ctx.input)),
});
export default offerRouter;
