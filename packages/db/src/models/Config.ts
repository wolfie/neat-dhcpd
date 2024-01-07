import type { InsertObject } from 'kysely';
import type { Database } from './types';
import db from '../db';

const Config = {
  set: async (values: InsertObject<Database, 'config'>) => {
    await db.deleteFrom('config').execute();
    await db.insertInto('config').values(values).execute();
  },
  get: () => db.selectFrom('config').selectAll().executeTakeFirst(),
};

export default Config;
