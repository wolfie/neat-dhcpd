import { sql } from 'kysely';
import { z } from 'zod';

export const CURRENT_TIMESTAMP_WITH_MILLIS = sql.raw<string>(
  "(STRFTIME('%Y-%m-%d %H:%M:%fZ', 'NOW'))"
);

export const Magnitude = z.union([z.literal('minutes'), z.literal('days')]);
export type Magnitude = z.TypeOf<typeof Magnitude>;
export const timestampWithOffset = (unit: number, magnitude: Magnitude) =>
  sql.raw<string>(
    `(STRFTIME('%Y-%m-%d %H:%M:%fZ', 'NOW', '${unit > 0 ? '+' : '-'}${unit} ${magnitude}'))`
  );
