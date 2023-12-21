import { sql } from "kysely";
import db from "../db";
import CURRENT_TIMESTAMP_WITH_MILLIS from "../lib/currentTimestamp";

const DEFAULT_OFFER_DURATION_MINS = 5;

// TODO run only if an offer has been added within the last DEFAULT_OFFER_DURATION_MINS
setInterval(async () => {
  db.deleteFrom("offer")
    .where("expires_at", "<", sql`datetime('now')`)
    .execute()
    .then((result) => result.reduce((sum, r) => sum + r.numDeletedRows, 0n))
    .then((deletedRows) => {
      if (deletedRows === 0n) return;
      console.log(`Cleaned up ${deletedRows} expired offers`);
    });
}, DEFAULT_OFFER_DURATION_MINS * 60_000);

const Offer = {
  getAll: () =>
    db
      .selectFrom("offer")
      .where("expires_at", "<", CURRENT_TIMESTAMP_WITH_MILLIS)
      .selectAll()
      .execute(),
  get: ({ mac }: { mac: string }) =>
    db
      .selectFrom("offer")
      .where("mac", "=", mac)
      .where("expires_at", "<", CURRENT_TIMESTAMP_WITH_MILLIS)
      .selectAll()
      .executeTakeFirst(),
  add: ({
    mac,
    ip,
    lease_time_secs,
  }: {
    mac: string;
    ip: string;
    lease_time_secs: number;
  }) =>
    db
      .insertInto("offer")
      .values({
        mac,
        ip,
        expires_at: sql`datetime('now', '+${sql.lit(
          DEFAULT_OFFER_DURATION_MINS
        )} minutes')`,
        lease_time_secs,
      })
      .onConflict((oc) =>
        oc
          .column("mac")
          .doUpdateSet({ ip, lease_time_secs })
          .where("mac", "=", mac)
      )
      .execute(),
  delete: ({ mac, ip }: { mac: string; ip: string }) =>
    db
      .deleteFrom("offer")
      .where("mac", "=", mac)
      .where("ip", "=", ip)
      .execute(),
};

export default Offer;
