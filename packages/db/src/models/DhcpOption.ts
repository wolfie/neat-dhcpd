import { z } from 'zod';
import { WithTraceId, publicProcedure, router } from '../trpc.js';
import passInputWithoutTracing from '../lib/passInput.js';
import db from '../db.js';

// TODO would be cool if there could be some kind of mapping from option number to value type.
// 6: z.array(ZIpString)

// TODO extract numbers to common package, e.g. export const OPTION_DOMAIN_NAME_SERVER = 6;

const get = ({ option }: { option: number }): Promise<unknown> =>
  db
    .selectFrom('dhcp_option')
    .select('dhcp_option.value_json')
    .where('dhcp_option.option', '=', option)
    .executeTakeFirst()
    .then((result) => result?.value_json && JSON.parse(result.value_json));

const set = ({ option, value_json }: { option: number; value_json: string }) =>
  db
    .insertInto('dhcp_option')
    .values({ option, value_json })
    .onConflict((oc) => oc.column('option').doUpdateSet({ value_json }))
    .execute()
    .then(() => undefined);

const dhcpOptionRouter = router({
  get: publicProcedure
    .input(WithTraceId(z.object({ option: z.number().int() })))
    .query(passInputWithoutTracing(get)),
  set: publicProcedure
    .input(WithTraceId(z.object({ option: z.number().int(), value_json: z.string() })))
    .mutation(passInputWithoutTracing(set)),
});

export default dhcpOptionRouter;
