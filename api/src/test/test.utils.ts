import { sql } from "kysely";

import { db } from "../db/database.js";
import { runMigrations } from "../db/migrate.js";

export const setupTestDatabase = async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setupTestDatabase can only run in test mode.");
  }

  await sql`
    DROP TABLE IF EXISTS
      "transactions",
      "recurringTransaction",
      "budgetItems",
      "accounts",
      "budgets",
      "categories",
      "authSessions",
      "authAccounts",
      "authVerifications",
      "users",
      "kysely_migration_lock",
      "kysely_migration"
    CASCADE
  `.execute(db);

  await sql`DROP TYPE IF EXISTS "account_type" CASCADE`.execute(db);

  await runMigrations();
};

export const resetTestDatabase = async () => {
  await sql`
    TRUNCATE TABLE
      "transactions",
      "recurringTransaction",
      "budgetItems",
      "accounts",
      "budgets",
      "categories",
      "authSessions",
      "authAccounts",
      "authVerifications",
      "users"
    RESTART IDENTITY CASCADE
  `.execute(db);
};
