import { Kysely } from "kysely";
import CURRENT_TIMESTAMP_WITH_MILLIS from "../lib/currentTimestamp";

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createTable("seen_mac")
    .ifNotExists()
    .addColumn("mac", "text", (col) => col.primaryKey().notNull())
    .addColumn("first_seen", "text", (col) =>
      col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull()
    )
    .addColumn("last_seen", "text", (col) =>
      col.defaultTo(CURRENT_TIMESTAMP_WITH_MILLIS).notNull()
    )
    .execute();
};

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable("seen_mac").ifExists().execute();
};
