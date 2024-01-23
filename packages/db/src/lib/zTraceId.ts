import { z } from 'zod';

export type ZTraceId = z.TypeOf<typeof zTraceId>;
const zTraceId = z.custom<`${string}:trace-id`>(
  (val: unknown) => typeof val === 'string' && val.endsWith(':trace-id')
);
export default zTraceId;
