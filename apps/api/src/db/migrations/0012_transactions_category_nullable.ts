import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "transactions"
    DROP CONSTRAINT IF EXISTS "transactions_categoryId_foreign"
  `.execute(db);

  await sql`
    ALTER TABLE "transactions"
    ALTER COLUMN "categoryId" DROP NOT NULL
  `.execute(db);

  await sql`
    ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_categoryId_foreign"
    FOREIGN KEY ("categoryId")
    REFERENCES "categories" ("id")
    ON DELETE SET NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    DELETE FROM "transactions"
    WHERE "categoryId" IS NULL
  `.execute(db);

  await sql`
    ALTER TABLE "transactions"
    DROP CONSTRAINT IF EXISTS "transactions_categoryId_foreign"
  `.execute(db);

  await sql`
    ALTER TABLE "transactions"
    ALTER COLUMN "categoryId" SET NOT NULL
  `.execute(db);

  await sql`
    ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_categoryId_foreign"
    FOREIGN KEY ("categoryId")
    REFERENCES "categories" ("id")
    ON DELETE CASCADE
  `.execute(db);
}
