import db from "../db";

const Alias = {
  get: () => db.selectFrom("alias").selectAll().execute(),
  set: (mac: string, alias: string) =>
    db
      .insertInto("alias")
      .values({ mac, alias })
      .onConflict((oc) =>
        oc.column("mac").doUpdateSet({ alias }).where("mac", "=", mac)
      )
      .execute(),
};

export default Alias;
