import getMigrator from '../getMigrator.js';

const migrateToLatest = async () => {
  const migrator = getMigrator();
  const migrations = await migrator.migrateToLatest();
  const resultStrings = migrations.results
    ?.filter((r) => r.status !== 'Error')
    .map((r) => `[${r.status}] [${r.direction}] ${r.migrationName}`);
  if (migrations.error) {
    console.error('DB migration failed');
    console.error('error', migrations.error);
    console.error('results');
    console.error(resultStrings?.join('\n'));
    process.exit(1);
  }

  console.log('DB migrations successful');
  console.log(resultStrings?.join('\n') || 'None required', '\n');
};

migrateToLatest();
