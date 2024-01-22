import type { Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>) => {
  await db.schema
    .alterTable('config')
    .addColumn('log_level', 'text', (col) => col.defaultTo('log').notNull())
    .execute();
};

export const down = async (db: Kysely<unknown>) => {
  await db.schema.alterTable('config').dropColumn('log_level').execute();
};
