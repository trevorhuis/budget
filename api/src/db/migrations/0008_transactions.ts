import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("transactions")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("merchant", "varchar(255)", (col) => col.notNull())
    .addColumn("amount", "numeric", (col) => col.notNull())
    .addColumn("notes", "text", (col) => col.notNull())
    .addColumn("date", "timestamptz", (col) => col.notNull())
    .addColumn("type", "varchar(255)", (col) => col.notNull())
    .addColumn("userId", "uuid", (col) => col.notNull())
    .addColumn("accountId", "uuid", (col) =>
      col.notNull().references("accounts.id"),
    )
    .addColumn("budgetItemId", "uuid", (col) =>
      col.notNull().references("budgetItems.id"),
    )
    .addColumn("recurringTemplateId", "uuid", (col) =>
      col.references("recurringTransaction.id").onDelete("set null"),
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
  await db.schema.dropTable("transactions").ifExists().execute();
}
