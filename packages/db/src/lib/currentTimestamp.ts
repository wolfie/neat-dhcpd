import { sql } from "kysely";

const CURRENT_TIMESTAMP_WITH_MILLIS = sql.raw<string>(
  "(STRFTIME('%Y-%m-%d %H:%M:%fZ', 'NOW'))"
);

export default CURRENT_TIMESTAMP_WITH_MILLIS;
