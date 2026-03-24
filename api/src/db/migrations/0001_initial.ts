import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("account_type")
    .asEnum(["savings", "checking", "creditCard"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropType("account_type").ifExists().execute();
}
