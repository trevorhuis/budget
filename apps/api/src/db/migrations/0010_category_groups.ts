import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("categories")
    .addColumn("group", "varchar(255)", (col) =>
      col.notNull().defaultTo("Other"),
    )
    .execute();

  await db
    .updateTable("categories")
    .set({
      group: sql`CASE
        WHEN type = 'income' THEN 'Income'
        ELSE 'Other'
      END`,
    })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("categories").dropColumn("group").execute();
}
