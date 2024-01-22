import { z } from 'zod';
import { router } from './trpc';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import type { inferRouterOutputs } from '@trpc/server';
import db from './db';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from './lib/sqlTimestamps';
import logRouter from './models/Log';
import configRouter from './models/Config';
import aliasRouter from './models/Alias';
import leaseRouter from './models/Lease';
import offerRouter from './models/Offer';
import seenMacRouter from './models/SeenMac';
import seenHostnameRouter from './models/SeenHostname';

const appRouter = router({
  log: logRouter,
  config: configRouter,
  alias: aliasRouter,
  lease: leaseRouter,
  offer: offerRouter,
  seenMac: seenMacRouter,
  seenHostname: seenHostnameRouter,
});

export type AppRouter = typeof appRouter;
// type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type Config = NonNullable<RouterOutput['config']['get']>;

const server = createHTTPServer({
  router: appRouter,
});

const env = z.object({ TPRC_SERVER_PORT: z.coerce.number().default(3000) }).parse(process.env);
const connection = server.listen(env.TPRC_SERVER_PORT);
console.log(`Starting tRPC server on port ${connection.port}`);

(async () => {
  // poke the db file so that other processes know that the file has been updated
  const { length } = await db.selectFrom('meta').selectAll().execute();
  if (length === 1) {
    await db.updateTable('meta').set({ last_startup: new Date().toISOString() }).execute();
  } else {
    if (length > 1) {
      await db.deleteFrom('meta').execute();
    }
    await db.insertInto('meta').values({ last_startup: CURRENT_TIMESTAMP_WITH_MILLIS }).execute();
  }
})();
