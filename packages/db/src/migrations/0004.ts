import type { Kysely } from 'kysely';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from '../lib/sqlTimestamps.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable('seen_hostname')
    .ifNotExists()
    .addColumn('mac', 'text', (col) => col.primaryKey().notNull())
    .addColumn('hostname', 'text', (col) => col.notNull())
    .addColumn('last_updated', 'text', (col) =>
      col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull()
    )
    .execute();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable('seen_hostname').ifExists().execute();
};
