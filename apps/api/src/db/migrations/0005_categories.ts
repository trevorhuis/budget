import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("categories")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("type", sql`category_type`, (col) => col.notNull())
    .addColumn("status", sql`category_status`, (col) =>
      col.notNull().defaultTo("active"),
    )
    .addColumn("userId", "uuid", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("categories").ifExists().execute();
}
