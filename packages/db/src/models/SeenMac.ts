import { z } from 'zod';
import db from '../db.js';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from '../lib/sqlTimestamps.js';
import { publicProcedure, router } from '../trpc.js';

const getAllWithAliases = () =>
  db
    .selectFrom('seen_mac')
    .leftJoin('alias', 'seen_mac.mac', 'alias.mac')
    .leftJoin('seen_hostname', 'seen_mac.mac', 'seen_hostname.mac')
    .orderBy('last_seen desc')
    .select([
      'seen_mac.mac',
      'seen_mac.first_seen',
      'seen_mac.last_seen',
      'alias.alias',
      'alias.added_at as alias_added_at',
      'seen_hostname.hostname',
      'seen_hostname.last_updated as hostname_last_updated',
    ])
    .execute();
const addSighting = ({ mac }: { mac: string }) =>
  db
    .insertInto('seen_mac')
    .values({ mac })
    .onConflict((oc) =>
      oc
        .column('mac')
        .doUpdateSet({ last_seen: CURRENT_TIMESTAMP_WITH_MILLIS })
        .where('mac', '=', mac)
    )
    .execute()
    .then(() => void 0);

const seenMacRouter = router({
  getAll: publicProcedure.query(getAllWithAliases),
  add: publicProcedure
    .input(z.object({ mac: z.string() }))
    .mutation((ctx) => addSighting(ctx.input)),
});
export default seenMacRouter;
