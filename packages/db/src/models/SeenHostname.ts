import { z } from 'zod';
import db from '../db';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from '../lib/sqlTimestamps';
import { publicProcedure, router } from '../trpc';

const UpsertInput = z.object({ mac: z.string(), hostname: z.string() });
type UpsertInput = z.TypeOf<typeof UpsertInput>;
const upsert = (input: UpsertInput) =>
  db
    .insertInto('seen_hostname')
    .values(input)
    .onConflict((oc) =>
      oc
        .column('mac')
        .doUpdateSet({ hostname: input.hostname, last_updated: CURRENT_TIMESTAMP_WITH_MILLIS })
    )
    .execute()
    .then(() => undefined);

const seenHostnameRouter = router({
  set: publicProcedure.input(UpsertInput).mutation((ctx) => upsert(ctx.input)),
});
export default seenHostnameRouter;
