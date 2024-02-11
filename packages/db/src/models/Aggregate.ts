import db from '../db.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';

export type Device = Awaited<ReturnType<typeof getAll>>[number];
const getAll = () =>
  db
    .selectFrom('seen_hostname as sh')
    .fullJoin('alias as a', 'a.mac', 'sh.mac')
    .fullJoin('lease as l', (fj) =>
      fj.on((eb) => eb('l.mac', '=', eb.fn.coalesce('a.mac', 'sh.mac')))
    )
    .fullJoin('offer as o', (fj) =>
      fj.on((eb) => eb('o.mac', '=', eb.fn.coalesce('a.mac', 'sh.mac', 'l.mac')))
    )
    .fullJoin('reserved_ip as ri', (fj) =>
      fj.on((eb) => eb('ri.mac', '=', eb.fn.coalesce('a.mac', 'sh.mac', 'l.mac', 'o.mac')))
    )
    .fullJoin('seen_mac as sm', (fj) =>
      fj.on((eb) =>
        eb('sm.mac', '=', eb.fn.coalesce('a.mac', 'sh.mac', 'l.mac', 'o.mac', 'ri.mac'))
      )
    )
    .select(({ fn }) => [
      fn.coalesce('sh.mac', 'a.mac', 'o.mac', 'ri.mac', 'sm.mac').as('mac'),
      'a.alias',
      'sh.hostname',
      'l.ip as leased_ip',
      'o.ip as offer_ip',
      'ri.ip as reserved_ip',
      'sm.first_seen',
      'sm.last_seen',
    ])
    .execute()
    .then((result) =>
      // TODO replace with .output()
      result.filter(<T extends { mac: string | null }>(t: T): t is T & { mac: string } => !!t.mac)
    );

const aggregateRouter = router({
  getAll: publicProcedure.input(WithTraceId()).query(getAll),
});
export default aggregateRouter;
