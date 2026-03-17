import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("accounts")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("type", sql`account_type`, (col) => col.notNull())
    .addColumn("balance", "numeric", (col) => col.notNull().defaultTo(0))
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
  await db.schema.dropTable("accounts").ifExists().execute();
}
