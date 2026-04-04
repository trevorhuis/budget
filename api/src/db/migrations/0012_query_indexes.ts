import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex("accounts_userId_idx")
    .ifNotExists()
    .on("accounts")
    .column("userId")
    .execute();

  await db.schema
    .createIndex("budgets_userId_idx")
    .ifNotExists()
    .on("budgets")
    .column("userId")
    .execute();

  await db.schema
    .createIndex("categories_userId_idx")
    .ifNotExists()
    .on("categories")
    .column("userId")
    .execute();

  await db.schema
    .createIndex("budgetItems_budgetId_idx")
    .ifNotExists()
    .on("budgetItems")
    .column("budgetId")
    .execute();

  await db.schema
    .createIndex("budgetItems_categoryId_idx")
    .ifNotExists()
    .on("budgetItems")
    .column("categoryId")
    .execute();

  await db.schema
    .createIndex("recurringTransaction_userId_idx")
    .ifNotExists()
    .on("recurringTransaction")
    .column("userId")
    .execute();

  await db.schema
    .createIndex("transactions_userId_date_idx")
    .ifNotExists()
    .on("transactions")
    .columns(["userId", "date desc"])
    .execute();

  await db.schema
    .createIndex("transactions_budgetItemId_date_idx")
    .ifNotExists()
    .on("transactions")
    .columns(["budgetItemId", "date desc"])
    .execute();

  await db.schema
    .createIndex("transactions_accountId_date_idx")
    .ifNotExists()
    .on("transactions")
    .columns(["accountId", "date desc"])
    .execute();

  await db.schema
    .createIndex("transactions_recurringTemplateId_idx")
    .ifNotExists()
    .on("transactions")
    .column("recurringTemplateId")
    .execute();

  await db.schema.dropIndex("calculators_userId_idx").ifExists().execute();

  await db.schema
    .createIndex("calculators_userId_updatedAt_idx")
    .ifNotExists()
    .on("calculators")
    .columns(["userId", "updatedAt desc"])
    .execute();

  await db.schema
    .createIndex("authAccounts_accountId_providerId_idx")
    .ifNotExists()
    .on("authAccounts")
    .columns(["accountId", "providerId"])
    .execute();

  await db.schema
    .createIndex("authVerifications_identifier_createdAt_idx")
    .ifNotExists()
    .on("authVerifications")
    .columns(["identifier", "createdAt desc"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropIndex("authVerifications_identifier_createdAt_idx")
    .ifExists()
    .execute();

  await db.schema
    .dropIndex("authAccounts_accountId_providerId_idx")
    .ifExists()
    .execute();

  await db.schema
    .dropIndex("calculators_userId_updatedAt_idx")
    .ifExists()
    .execute();

  await db.schema
    .createIndex("calculators_userId_idx")
    .ifNotExists()
    .on("calculators")
    .column("userId")
    .execute();

  await db.schema
    .dropIndex("transactions_recurringTemplateId_idx")
    .ifExists()
    .execute();

  await db.schema
    .dropIndex("transactions_accountId_date_idx")
    .ifExists()
    .execute();

  await db.schema
    .dropIndex("transactions_budgetItemId_date_idx")
    .ifExists()
    .execute();

  await db.schema.dropIndex("transactions_userId_date_idx").ifExists().execute();

  await db.schema
    .dropIndex("recurringTransaction_userId_idx")
    .ifExists()
    .execute();

  await db.schema.dropIndex("budgetItems_categoryId_idx").ifExists().execute();

  await db.schema.dropIndex("budgetItems_budgetId_idx").ifExists().execute();

  await db.schema.dropIndex("categories_userId_idx").ifExists().execute();

  await db.schema.dropIndex("budgets_userId_idx").ifExists().execute();

  await db.schema.dropIndex("accounts_userId_idx").ifExists().execute();
}
