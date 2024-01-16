import { z } from 'zod';
import db from '../db';
import { publicProcedure, router } from '../trpc';

const getAll = () => db.selectFrom('alias').selectAll().execute();

const SetInput = z.object({ mac: z.string(), alias: z.string() });
type SetInput = z.TypeOf<typeof SetInput>;
const set = ({ mac, alias }: SetInput) =>
  db
    .insertInto('alias')
    .values({ mac, alias })
    .onConflict((oc) => oc.column('mac').doUpdateSet({ alias }).where('mac', '=', mac))
    .execute()
    .then(() => undefined);

const DeleteInput = z.object({ mac: z.string() });
type DeleteInput = z.TypeOf<typeof DeleteInput>;
const del = ({ mac }: DeleteInput) =>
  db
    .deleteFrom('alias')
    .where('mac', '=', mac)
    .limit(1)
    .execute()
    .then(() => undefined);

export default router({
  getAll: publicProcedure.query(getAll),
  set: publicProcedure.input(SetInput).mutation((ctx) => set(ctx.input)),
  delete: publicProcedure.input(DeleteInput).mutation((ctx) => del(ctx.input)),
});
