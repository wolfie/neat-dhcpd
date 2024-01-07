import type { Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable('meta')
    .ifNotExists()
    .addColumn('last_startup', 'text', (col) => col.primaryKey().notNull())
    .execute();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable('meta').ifExists().execute();
};
