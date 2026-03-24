import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("calculators")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("userId", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("calculatorType", "text", (col) => col.notNull())
    .addColumn("data", "jsonb", (col) => col.notNull())
    .addColumn("shareToken", "text", (col) => col.unique())
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("calculators_userId_idx")
    .ifNotExists()
    .on("calculators")
    .column("userId")
    .execute();

  await db.schema
    .createIndex("calculators_shareToken_idx")
    .ifNotExists()
    .on("calculators")
    .column("shareToken")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("calculators_shareToken_idx").ifExists().execute();
  await db.schema.dropIndex("calculators_userId_idx").ifExists().execute();
  await db.schema.dropTable("calculators").ifExists().execute();
}
