import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("transactionRecurring")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("merchant", "varchar(255)", (col) => col.notNull())
    .addColumn("amount", "numeric", (col) => col.notNull())
    .addColumn("notes", "text", (col) => col.notNull())
    .addColumn("userId", "uuid", (col) => col.notNull())
    .addColumn("categoryId", "uuid", (col) =>
      col.notNull().references("categories.id").onDelete("cascade"),
    )
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("transactionRecurring").ifExists().execute();
}
