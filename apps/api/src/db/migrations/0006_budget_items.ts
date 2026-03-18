import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("budgetItems")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("allocatedAmount", "numeric", (col) => col.notNull())
    .addColumn("actualAmount", "numeric", (col) => col.notNull().defaultTo(0))
    .addColumn("budgetId", "uuid", (col) =>
      col.notNull().references("budgets.id").onDelete("cascade"),
    )
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
  await db.schema.dropTable("budgetItems").ifExists().execute();
}
