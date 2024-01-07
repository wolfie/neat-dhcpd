import type { Database } from './types';
import type { InsertObject } from 'kysely';
import db from '../db';

const Log = {
  insert: (values: InsertObject<Database, 'log'>) => db.insertInto('log').values(values).execute(),
  get: ({ offset, limit }: { offset: number; limit: number }) =>
    db
      .selectFrom('log')
      .orderBy('timestamp desc')
      .offset(offset)
      .limit(limit)
      .selectAll()
      .execute(),
};

export default Log;
