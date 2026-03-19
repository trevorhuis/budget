import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("categories").dropColumn("status").execute();
  await sql`DROP TYPE IF EXISTS category_status`.execute(db);

  await sql`
    ALTER TABLE "budgetItems"
    RENAME COLUMN "allocatedAmount" TO "spentAmount"
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "budgetItems"
    RENAME COLUMN "spentAmount" TO "allocatedAmount"
  `.execute(db);

  await db.schema
    .createType("category_status")
    .asEnum(["active", "inactive"])
    .execute();

  await db.schema
    .alterTable("categories")
    .addColumn("status", sql`category_status`, (col) =>
      col.notNull().defaultTo("active"),
    )
    .execute();
}
