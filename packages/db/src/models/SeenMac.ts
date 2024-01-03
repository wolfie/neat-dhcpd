import db from "../db";
import CURRENT_TIMESTAMP_WITH_MILLIS from "../lib/currentTimestamp";

const SeenMac = {
  getAll: () => db.selectFrom("seen_mac").selectAll().execute(),
  addSighting: (mac: string) =>
    db
      .insertInto("seen_mac")
      .values({ mac })
      .onConflict((oc) =>
        oc
          .column("mac")
          .doUpdateSet({ last_seen: CURRENT_TIMESTAMP_WITH_MILLIS })
          .where("mac", "=", mac)
      )
      .execute()
      .then(() => void 0),
};

export default SeenMac;
