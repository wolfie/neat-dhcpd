import { Migrator } from 'kysely';
import db from './db.js';
import * as m0001 from './migrations/0001.js';
import * as m0002 from './migrations/0002.js';
import * as m0003 from './migrations/0003.js';
import * as m0004 from './migrations/0004.js';
import * as m0005 from './migrations/0005.js';
import * as m0006 from './migrations/0006.js';
import * as m0007 from './migrations/0007.js';

const getMigrator = () =>
  new Migrator({
    db,
    provider: {
      // Kysely's `FileMigrationProvider` doesn't work well with ESM
      getMigrations: async () => ({
        m0001,
        m0002,
        m0003,
        m0004,
        m0005,
        m0006,
        m0007,
      }),
    },
  });

export default getMigrator;
