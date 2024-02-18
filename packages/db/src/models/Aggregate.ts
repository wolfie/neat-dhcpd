import { z } from 'zod';
import db from '../db.js';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import zIpString from '../lib/zIpString.js';
import { ipFromString, ipIsWithinRange } from '@neat-dhcpd/common';
import passInputWithoutTracing from '../lib/passInput.js';

export type Device = Awaited<ReturnType<typeof getAllDevices>>[number];
const getAllDevices = () =>
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

const IpOfferInfoInput = z.object({ mac: z.string(), requestedIp: zIpString.optional() });
type IpOfferInfoInput = z.TypeOf<typeof IpOfferInfoInput>;
const getIpOfferInfo = async ({ mac, requestedIp }: IpOfferInfoInput) => {
  const [reservedIp, previousOffer, previouslyLeasedIp, config, offeredOrLeasedForOthers] =
    await Promise.all([
      db
        .selectFrom('reserved_ip')
        .select('reserved_ip.ip')
        .where('mac', '=', mac)
        .executeTakeFirst()
        .then((result) => result?.ip),
      db
        .selectFrom('offer')
        .select(['offer.ip', 'offer.lease_time_secs'])
        .where('mac', '=', mac)
        .executeTakeFirst(),
      db
        .selectFrom('lease')
        .select('lease.ip')
        .where('mac', '=', mac)
        .executeTakeFirst()
        .then((result) => result?.ip),
      db.selectFrom('config').select(['ip_start', 'ip_end']).executeTakeFirst(),
      db
        .selectFrom('offer')
        .select('ip')
        .where('offer.mac', '!=', mac)
        .union(db.selectFrom('lease').select('ip').where('lease.mac', '!=', mac))
        .execute()
        .then((result) => result.map((r) => r.ip)),
    ]);

  const start = ipFromString(config?.ip_start);
  const end = ipFromString(config?.ip_end);
  let requestedIpIsWithinRange: boolean | 'no-range-defined' | 'no-ip-requested';
  if (requestedIp) {
    requestedIpIsWithinRange =
      start && end
        ? ipIsWithinRange(ipFromString(requestedIp), { start, end })
        : 'no-range-defined';
  } else {
    requestedIpIsWithinRange = 'no-ip-requested';
  }

  return {
    reservedIp,
    previousOffer,
    previouslyLeasedIp,
    offeredOrLeasedForOthers,
    requestedIpIsWithinRange,
  };
};

const aggregateRouter = router({
  getAllDevices: publicProcedure.input(WithTraceId()).query(getAllDevices),
  getIpOfferInfo: publicProcedure
    .input(WithTraceId(IpOfferInfoInput))
    .query(passInputWithoutTracing(getIpOfferInfo)),
});
export default aggregateRouter;
