import getMigrator from "../getMigrator";

(async () => {
  const migrator = getMigrator();
  const migrations = await migrator.getMigrations();
  const lastMigration = migrations.at(-1);
  if (!lastMigration) {
    console.error("no migrations found");
    process.exit(1);
  }
  console.log(
    `reapplying ${lastMigration.name}` +
      (lastMigration.executedAt
        ? ` (executed at ${lastMigration.executedAt?.toISOString()})`
        : "")
  );

  console.log("migrating down...");
  const down = await migrator.migrateDown();
  if (down.error || down.results?.some((r) => r.status === "Error")) {
    console.log("ERROR! %j", down);
    process.exit(1);
  }
  console.log("migrating up...");
  const up = await migrator.migrateUp();
  if (up.error || up.results?.some((r) => r.status === "Error")) {
    console.log("ERROR! %j", up);
    process.exit(1);
  }

  console.log("done!");
})();
