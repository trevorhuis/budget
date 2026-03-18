import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("account_type")
    .asEnum(["savings", "checking", "credit"])
    .execute();

  await db.schema
    .createType("category_type")
    .asEnum(["income", "expense"])
    .execute();

  await db.schema
    .createType("category_status")
    .asEnum(["active", "inactive"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropType("category_status").ifExists().execute();
  await db.schema.dropType("category_type").ifExists().execute();
  await db.schema.dropType("account_type").ifExists().execute();
}
