import { sql } from "kysely";

import { db } from "../db/database.js";
import { runMigrations } from "../db/migrate.js";

export const PRIMARY_USER_ID = "019cf45e-80f5-714a-a121-bb32f8364813";
export const SECONDARY_USER_ID = "019cf45e-80f5-714a-a121-bb32f8364814";

export const setupTestDatabase = async () => {
  await runMigrations();
};

export const resetTestDatabase = async () => {
  await sql`
    TRUNCATE TABLE
      "transactions",
      "transactionRecurring",
      "budgetItems",
      "accounts",
      "buckets",
      "budgets",
      "categories",
      "users"
    RESTART IDENTITY CASCADE
  `.execute(db);

  await db
    .insertInto("users")
    .values([
      { id: PRIMARY_USER_ID, name: "Primary Tester" },
      { id: SECONDARY_USER_ID, name: "Secondary Tester" },
    ])
    .execute();
};
