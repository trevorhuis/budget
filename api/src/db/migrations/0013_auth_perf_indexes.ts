import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("rateLimit")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("key", "text", (col) => col.notNull().unique())
    .addColumn("count", "integer", (col) => col.notNull())
    .addColumn("lastRequest", "bigint", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("authSessions_expiresAt_idx")
    .ifNotExists()
    .on("authSessions")
    .column("expiresAt")
    .execute();

  await db.schema
    .createIndex("users_email_idx")
    .ifNotExists()
    .on("users")
    .column("email")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("users_email_idx").ifExists().execute();
  await db.schema.dropIndex("authSessions_expiresAt_idx").ifExists().execute();
  await db.schema.dropTable("rateLimit").ifExists().execute();
}
