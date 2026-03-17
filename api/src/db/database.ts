import { Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";
import { type Database } from "./types.js";
import { env } from "../env.js";

const databaseUrl = env.DATABASE_URL;

types.setTypeParser(types.builtins.NUMERIC, (value) => {
  if (value === null) {
    return null;
  }

  return Number.parseFloat(value);
});

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export const closeDb = async () => {
  await db.destroy();
};

export default db;
