import { setCurrentSystem } from '@neat-dhcpd/litel';
setCurrentSystem('db');

import { z } from 'zod';
import { router } from './trpc.js';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import type { inferRouterOutputs } from '@trpc/server';
import db from './db.js';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from './lib/sqlTimestamps.js';
import logRouter from './models/Log.js';
import configRouter from './models/Config.js';
import aliasRouter from './models/Alias.js';
import leaseRouter from './models/Lease.js';
import offerRouter from './models/Offer.js';
import seenMacRouter from './models/SeenMac.js';
import seenHostnameRouter from './models/SeenHostname.js';
import reservedIpRouter from './models/ReservedIp.js';
import dhcpOptionRouter from './models/DhcpOption.js';

const appRouter = router({
  log: logRouter,
  config: configRouter,
  alias: aliasRouter,
  lease: leaseRouter,
  offer: offerRouter,
  seenMac: seenMacRouter,
  seenHostname: seenHostnameRouter,
  reservedIp: reservedIpRouter,
  dhcpOption: dhcpOptionRouter,
});

export type AppRouter = typeof appRouter;
// type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type Config = NonNullable<RouterOutput['config']['get']>;

const server = createHTTPServer({
  router: appRouter,
  createContext: () => ({ trace: undefined /* trace is made in the procedure middleware */ }),
});

const env = z.object({ TPRC_SERVER_PORT: z.coerce.number().default(3000) }).parse(process.env);
const connection = server.listen(env.TPRC_SERVER_PORT);
console.log(`Starting tRPC server on port ${connection.port}`);

(async () => {
  console.log('modifying db file...');
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
  console.log('...done');
})();
