import { sql } from 'kysely';

export const CURRENT_TIMESTAMP_WITH_MILLIS = sql.raw<string>(
  "(STRFTIME('%Y-%m-%d %H:%M:%fZ', 'NOW'))"
);

export const timestampAfter = (unit: number, magnitude: 'minutes') =>
  sql.raw<string>(
    `(STRFTIME('%Y-%m-%d %H:%M:%fZ', 'NOW', '${unit > 0 ? '+' : '-'}${unit} ${magnitude}'))`
  );
