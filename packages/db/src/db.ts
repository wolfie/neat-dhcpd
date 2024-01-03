import SqliteDatabase from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import path from "path";
import { Database } from "./models/types";
import findPackageJson from "find-package-json";

let loopDetection = [0];
const LOOP_DETECTION_LIMIT = 2;

const initializeDb = () => {
  let projectRoot = "";
  for (const pj of findPackageJson(process.cwd())) {
    if (pj.name !== "neat-dhcpd") continue;
    projectRoot = path.dirname(pj.__path);
    break;
  }
  if (!projectRoot) throw new Error("Could not find root project");

  const DB_PATH = path.resolve(projectRoot, "db.sqlite");
  console.log(`sqlite path: ${DB_PATH}`);

  const dialect = new SqliteDialect({
    database: new SqliteDatabase(DB_PATH),
  });
  const db = new Kysely<Database>({
    dialect,
    log: async (e) => {
      loopDetection[0]++;
      if (loopDetection[0] < 0) {
        console.error(`${new Date().toISOString()}: SQL write loop underflow`);
        loopDetection[0] = 0;
        process.exit(1);
      }
      if (loopDetection[0] > LOOP_DETECTION_LIMIT) {
        console.error(
          `${new Date().toISOString()}: SQL write loop detected. Latest event: %j`,
          e
        );
        loopDetection[0] = 0;
        process.exit(1);
      }
      try {
        if (e.level === "query") {
          // TODO add query logging to some debug setting
          // console.log(
          //   `${new Date().toISOString()}: ${e.query.sql} @ ${JSON.stringify(
          //     e.query.parameters
          //   )}`
          // );
        } else {
          console.log(`${new Date().toISOString()}: writing error %j`, e);
          await db
            .insertInto("log")
            .values({ system: "db", level: "error", json: JSON.stringify(e) })
            .execute();
        }
      } finally {
        loopDetection[0]--;
      }
    },
  });
  return db;
};

const db = initializeDb();
export default db;
