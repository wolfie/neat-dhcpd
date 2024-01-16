import { z } from 'zod';

export type ZIpString = z.TypeOf<typeof zIpString>;
const zIpString = z.custom<`${number}.${number}.${number}.${number}`>(
  (val: unknown) => typeof val === 'string' && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)
);
export default zIpString;
