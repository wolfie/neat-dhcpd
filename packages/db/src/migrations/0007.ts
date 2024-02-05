/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely';

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable('dhcp_option')
    .addColumn('option', 'integer', (col) => col.notNull().primaryKey())
    .addColumn('value_json', 'text', (col) => col.notNull())
    .execute();

  const existingDnsConfig = await db
    .selectFrom('config')
    .select(['dns1', 'dns2', 'dns3', 'dns4'])
    .executeTakeFirst();
  if (existingDnsConfig) {
    const dnsJson = Object.values(existingDnsConfig).filter(Boolean);
    await db
      .insertInto('dhcp_option')
      .values({ option: 6, value_json: JSON.stringify(dnsJson) })
      .execute();
  }

  await db.schema.alterTable('config').dropColumn('dns1').execute();
  await db.schema.alterTable('config').dropColumn('dns2').execute();
  await db.schema.alterTable('config').dropColumn('dns3').execute();
  await db.schema.alterTable('config').dropColumn('dns4').execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema
    .alterTable('config')
    .addColumn('dns1', 'text', (col) => col.notNull())
    .addColumn('dns2', 'text')
    .addColumn('dns3', 'text')
    .addColumn('dns4', 'text')
    .execute();

  const existingDnsConfig = await db
    .selectFrom('dhcp_option')
    .select('value_json')
    .where('option', '=', 6)
    .executeTakeFirst();
  if (existingDnsConfig) {
    const [dns1, dns2, dns3, dns4] = JSON.parse(existingDnsConfig.value_json);
    await db.updateTable('config').set({ dns1, dns2, dns3, dns4 }).execute();
  }

  await db.schema.dropTable('dhcp_option');
};
