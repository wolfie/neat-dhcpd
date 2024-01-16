import { FileMigrationProvider, Migrator } from 'kysely';
import db from './db';
import path from 'path';
import fs from 'fs/promises';

const getMigrator = () =>
  new Migrator({
    db,
    provider: new FileMigrationProvider({
      path,
      fs,
      migrationFolder: path.resolve(__dirname, 'migrations'),
    }),
  });

export default getMigrator;
