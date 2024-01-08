import SqliteDatabase from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';
import type { Database } from './models/types';
import { z } from 'zod';

const env = z.object({ SQLITE_PATH: z.string().default('../../db.sqlite') }).parse(process.env);

const loopDetection = [0];
const LOOP_DETECTION_LIMIT = 2;

const initializeDb = () => {
  const DB_PATH = path.resolve(env.SQLITE_PATH);
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
        console.error(`${new Date().toISOString()}: SQL write loop detected. Latest event: %j`, e);
        loopDetection[0] = 0;
        process.exit(1);
      }
      try {
        if (e.level === 'query') {
          // TODO add query logging to some debug setting
          // console.log(
          //   `${new Date().toISOString()}: ${e.query.sql} @ ${JSON.stringify(
          //     e.query.parameters
          //   )}`
          // );
        } else {
          console.log(`${new Date().toISOString()}: writing error %j`, e);
          await db
            .insertInto('log')
            .values({ system: 'db', level: 'error', json: JSON.stringify(e) })
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
