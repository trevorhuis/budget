import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("authSessions")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("ipAddress", "text")
    .addColumn("userAgent", "text")
    .addColumn("userId", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("authSessions_userId_idx")
    .ifNotExists()
    .on("authSessions")
    .column("userId")
    .execute();

  await db.schema
    .createTable("authAccounts")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("accountId", "text", (col) => col.notNull())
    .addColumn("providerId", "text", (col) => col.notNull())
    .addColumn("userId", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("accessToken", "text")
    .addColumn("refreshToken", "text")
    .addColumn("idToken", "text")
    .addColumn("accessTokenExpiresAt", "timestamptz")
    .addColumn("refreshTokenExpiresAt", "timestamptz")
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("authAccounts_userId_idx")
    .ifNotExists()
    .on("authAccounts")
    .column("userId")
    .execute();

  await db.schema
    .createTable("authVerifications")
    .ifNotExists()
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("authVerifications_identifier_idx")
    .ifNotExists()
    .on("authVerifications")
    .column("identifier")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("authVerifications_identifier_idx").ifExists().execute();
  await db.schema.dropTable("authVerifications").ifExists().execute();
  await db.schema.dropIndex("authAccounts_userId_idx").ifExists().execute();
  await db.schema.dropTable("authAccounts").ifExists().execute();
  await db.schema.dropIndex("authSessions_userId_idx").ifExists().execute();
  await db.schema.dropTable("authSessions").ifExists().execute();
}
