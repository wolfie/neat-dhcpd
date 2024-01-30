import { z } from 'zod';
import db from '../db.js';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from '../lib/sqlTimestamps.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import zIpString from '../lib/zIpString.js';
import passInputWithoutTracing from '../lib/passInput.js';

// TODO run only if an offer has been added within the last DEFAULT_OFFER_DURATION_MINS
setInterval(async () => {
  db.deleteFrom('lease')
    .where('expires_at', '<', CURRENT_TIMESTAMP_WITH_MILLIS)
    .execute()
    .then((result) => result.reduce((sum, r) => sum + r.numDeletedRows, 0n))
    .then((deletedRows) => {
      if (deletedRows === 0n) return;
      console.log(`Cleaned up ${deletedRows} expired leases`);
    });
}, 5 * 60_000);

const getAll = () =>
  db
    .selectFrom('lease')
    .where('expires_at', '>', CURRENT_TIMESTAMP_WITH_MILLIS)
    .selectAll()
    .execute();

const get = ({ mac }: { mac: string }) =>
  db
    .selectFrom('lease')
    .where('expires_at', '>', CURRENT_TIMESTAMP_WITH_MILLIS)
    .where('mac', '=', mac)
    .selectAll()
    .executeTakeFirst();

const SetInput = z.object({ mac: z.string(), ip: zIpString, expires_at: z.string() });
type SetInput = z.TypeOf<typeof SetInput>;
const set = ({ ip, mac, expires_at }: SetInput) =>
  db
    .insertInto('lease')
    .values({ ip, mac, expires_at })
    .onConflict((oc) =>
      oc.column('mac').doUpdateSet({ ip, expires_at, leased_at: CURRENT_TIMESTAMP_WITH_MILLIS })
    )
    .execute()
    .then(() => undefined);

const leaseRouter = router({
  getAll: publicProcedure.input(WithTraceId()).query(getAll),
  get: publicProcedure
    .input(WithTraceId(z.object({ mac: z.string() })))
    .query((ctx) => get(ctx.input)),
  set: publicProcedure.input(WithTraceId(SetInput)).mutation(passInputWithoutTracing(set)),
});

export default leaseRouter;
