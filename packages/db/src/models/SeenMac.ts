import { z } from 'zod';
import db from '../db';
import CURRENT_TIMESTAMP_WITH_MILLIS from '../lib/currentTimestamp';
import { publicProcedure, router } from '../trpc';

const getAllWithAliases = () =>
  db
    .selectFrom('seen_mac')
    .leftJoin('alias', 'seen_mac.mac', 'alias.mac')
    .orderBy('last_seen desc')
    .select([
      'seen_mac.mac',
      'seen_mac.first_seen',
      'seen_mac.last_seen',
      'alias.alias',
      'alias.added_at',
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

export default router({
  getAll: publicProcedure.query(getAllWithAliases),
  add: publicProcedure
    .input(z.object({ mac: z.string() }))
    .mutation((ctx) => addSighting(ctx.input)),
});
