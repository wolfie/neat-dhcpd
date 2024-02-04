import type { Kysely } from 'kysely';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from '../lib/sqlTimestamps.js';

export const up = async (db: Kysely<unknown>) => {
  await db.schema
    .createTable('reserved_ip')
    .addColumn('mac', 'text', (col) => col.notNull().primaryKey())
    .addColumn('ip', 'text', (col) => col.notNull())
    .addColumn('last_updated', 'text', (col) =>
      col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull()
    )
    .execute();
};

export const down = async (db: Kysely<unknown>) => {
  await db.schema.dropTable('reserved_ip').execute();
};
