import { z } from 'zod';
import passInputWithoutTracing from '../lib/passInput.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import zIpString from '../lib/zIpString.js';
import db from '../db.js';

const AddInput = z.object({ mac: z.string(), ip: zIpString });
type AddInput = z.TypeOf<typeof AddInput>;
const add = ({ mac, ip }: AddInput) =>
  db
    .insertInto('reserved_ip')
    .values({ mac, ip })
    .onConflict((oc) => oc.column('mac').doUpdateSet({ ip }))
    .execute()
    .then(() => undefined);

const DeleteInput = z.object({ mac: z.string() });
type DeleteInput = z.TypeOf<typeof DeleteInput>;
const del = ({ mac }: DeleteInput) =>
  db
    .deleteFrom('reserved_ip')
    .where('mac', '=', mac)
    .execute()
    .then(() => undefined);

const getAll = () => db.selectFrom('reserved_ip').selectAll().execute();

const GetInput = z.object({ mac: z.string() });
type GetInput = z.TypeOf<typeof GetInput>;
const get = ({ mac }: GetInput) =>
  db
    .selectFrom('reserved_ip')
    .selectAll()
    .where('mac', '=', mac)
    .limit(1)
    .execute()
    .then((result) => result.at(0));

const reservedIpRouter = router({
  add: publicProcedure.input(WithTraceId(AddInput)).mutation(passInputWithoutTracing(add)),
  delete: publicProcedure.input(WithTraceId(DeleteInput)).mutation(passInputWithoutTracing(del)),
  getAll: publicProcedure.input(WithTraceId()).query(passInputWithoutTracing(getAll)),
  get: publicProcedure.input(WithTraceId(GetInput)).query(passInputWithoutTracing(get)),
});

export default reservedIpRouter;
