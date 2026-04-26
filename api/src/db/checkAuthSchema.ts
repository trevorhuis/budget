import { getMigrations } from "better-auth/db/migration";

import { authOptions } from "../lib/auth.js";
import { closeDb } from "./database.js";

const checkAuthSchema = async () => {
  try {
    const { toBeAdded, toBeCreated, compileMigrations } =
      await getMigrations(authOptions);

    if (toBeAdded.length === 0 && toBeCreated.length === 0) {
      console.log("[auth-schema] Better Auth schema is in sync.");
      return;
    }

    console.error("[auth-schema] Better Auth schema drift detected.");
    console.error(await compileMigrations());
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
};

void checkAuthSchema();
