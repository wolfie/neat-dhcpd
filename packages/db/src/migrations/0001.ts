import type { Kysely } from 'kysely';
import { CURRENT_TIMESTAMP_WITH_MILLIS } from '../lib/sqlTimestamps';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const up = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .createTable('config')
    .ifNotExists()
    .addColumn('send_replies', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('ip_start', 'text', (col) => col.notNull())
    .addColumn('ip_end', 'text', (col) => col.notNull())
    .addColumn('lease_time_minutes', 'integer', (col) => col.notNull())
    .addColumn('gateway_ip', 'text', (col) => col.notNull())
    .addColumn('dns1', 'text', (col) => col.notNull())
    .addColumn('dns2', 'text')
    .addColumn('dns3', 'text')
    .addColumn('dns4', 'text')
    .addColumn('broadcast_cidr', 'text')
    .execute();

  await db
    .insertInto('config')
    .values({
      ip_start: '192.168.0.2',
      ip_end: '192.168.0.254',
      lease_time_minutes: 120,
      gateway_ip: '192.168.0.1',
      dns1: '1.1.1.1',
      dns2: '1.0.0.1',
      dns3: '8.8.8.8',
      dns4: '8.6.6.8',
    })
    .execute();

  await db.schema
    .createTable('log')
    .ifNotExists()
    .addColumn('timestamp', 'text', (col) => col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull())
    .addColumn('level', 'text', (col) => col.notNull())
    .addColumn('system', 'text', (col) => col.notNull())
    .addColumn('json', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('offer')
    .ifNotExists()
    .addColumn('mac', 'text', (col) => col.primaryKey().notNull())
    .addColumn('ip', 'text', (col) => col.notNull())
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('offered_at', 'text', (col) =>
      col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull()
    )
    .addColumn('lease_time_secs', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('lease')
    .ifNotExists()
    .addColumn('mac', 'text', (col) => col.primaryKey().notNull())
    .addColumn('ip', 'text', (col) => col.notNull())
    .addColumn('leased_at', 'text', (col) => col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull())
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('alias')
    .ifNotExists()
    .addColumn('mac', 'text', (col) => col.primaryKey().notNull())
    .addColumn('alias', 'text', (col) => col.notNull())
    .addColumn('added_at', 'text', (col) => col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull())
    .execute();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const down = async (db: Kysely<any>): Promise<void> => {
  await db.schema.dropTable('aliases').ifExists().execute();
  await db.schema.dropTable('leases').ifExists().execute();
  await db.schema.dropTable('offers').ifExists().execute();
  await db.schema.dropTable('logs').ifExists().execute();
  await db.schema.dropTable('config').ifExists().execute();
};
