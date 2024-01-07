import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import type { inferRouterOutputs } from '@trpc/server';
import Log from './models/Log';
import Config from './models/Config';
import Alias from './models/Alias';
import Lease from './models/Lease';
import Offer from './models/Offer';
import log from './lib/log';
import SeenMac from './models/SeenMac';
import db from './db';
import CURRENT_TIMESTAMP_WITH_MILLIS from './lib/currentTimestamp';

const zIpString = z.custom<`${number}.${number}.${number}.${number}`>(
  (val: unknown) => typeof val === 'string' && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)
);

const zLease = z.object({
  mac: z.string(),
  ip: zIpString,
  expires_at: z.coerce.date(),
});

const zOffers = z.array(
  z.object({
    mac: z.string(),
    ip: zIpString,
    expires_at: z.coerce.date(),
    offered_at: z.coerce.date(),
  })
);

const zLogLevel = z.union([z.literal('log'), z.literal('error'), z.literal('debug')]);

const appRouter = router({
  logsGet: publicProcedure
    .input(z.object({ limit: z.number(), offset: z.number() }))
    .query((ctx) => Log.get(ctx.input)),
  logAdd: publicProcedure
    .input(
      z.object({
        system: z.string(),
        level: zLogLevel,
        json: z.unknown(),
      })
    )
    .mutation(async (opts) =>
      log({
        system: opts.input.system,
        level: opts.input.level,
        json: opts.input.json,
      }).then(() => true)
    ),
  configSave: publicProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async (opts) => {
      await Config.set(opts.input);
      return true;
    }),
  configGet: publicProcedure.query(Config.get),
  aliasSet: publicProcedure
    .input(z.object({ mac: z.string(), alias: z.string() }))
    .mutation(async (opts) => {
      await Alias.set(opts.input.mac, opts.input.alias);
    }),
  aliasDelete: publicProcedure.input(z.string()).mutation(async (opts) => {
    await Alias.delete(opts.input);
  }),
  leasesGet: publicProcedure.query(() => Lease.getAll().then(z.array(zLease).parse)),
  leaseGet: publicProcedure
    .input(z.object({ mac: z.string() }))
    .query((ctx) => Lease.get(ctx.input)),
  offersGet: publicProcedure.query(() => Offer.getAll().then(zOffers.parse)),
  offerGet: publicProcedure
    .input(z.object({ mac: z.string() }))
    .query((ctx) => Offer.get(ctx.input)),
  offerAdd: publicProcedure
    .input(
      z.object({
        mac: z.string(),
        ip: zIpString,
        lease_time_secs: z.number().int(),
      })
    )
    .mutation(async (ctx) => {
      await Offer.add(ctx.input);
    }),
  offerDelete: publicProcedure
    .input(z.object({ mac: z.string(), ip: zIpString }))
    .mutation(async (ctx) => {
      await Offer.delete(ctx.input);
    }),
  getSeenMacs: publicProcedure.query(SeenMac.getAllWithAliases),
  addSeenMac: publicProcedure
    .input(z.object({ mac: z.string() }))
    .mutation((ctx) => SeenMac.addSighting(ctx.input.mac)),
});

export type AppRouter = typeof appRouter;
// type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type Config = NonNullable<RouterOutput['configGet']>;

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
