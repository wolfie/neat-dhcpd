import db from "../db";
import CURRENT_TIMESTAMP_WITH_MILLIS from "../lib/currentTimestamp";

const Lease = {
  getAll: () =>
    db
      .selectFrom("lease")
      .where("expires_at", "<", CURRENT_TIMESTAMP_WITH_MILLIS)
      .selectAll()
      .execute(),
  get: ({ mac }: { mac: string }) =>
    db
      .selectFrom("lease")
      .where("expires_at", "<", CURRENT_TIMESTAMP_WITH_MILLIS)
      .where("mac", "=", mac)
      .selectAll()
      .executeTakeFirst(),
};

export default Lease;
