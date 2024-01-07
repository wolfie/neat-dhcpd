import type { Kysely } from 'kysely';
import { sql } from 'kysely';

const dropColumnIfExists = async (db: Kysely<unknown>, tableName: string, columnName: string) => {
  const columnExists = await sql<{
    exists: number;
  }>`select count(*) as 'exists' from pragma_table_info(${sql.lit(
    tableName
  )}) where name = '${sql.lit(columnName)}'`
    .execute(db)
    .then((result) => Boolean(result.rows[0].exists));

  if (columnExists) {
    await db.schema.alterTable(tableName).dropColumn(columnName).execute();
  }
};

export default dropColumnIfExists;
