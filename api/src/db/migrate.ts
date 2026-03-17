import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { FileMigrationProvider, Migrator } from "kysely";
import { closeDb, db } from "./database.js";

const migrationDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

export const runMigrations = async ({ closeConnection = false } = {}) => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: migrationDir,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (results) {
    for (const result of results) {
      if (result.status === "Success") {
        console.log(
          `[migrations] migrated ${result.migrationName} (${result.direction}): ${result.status}`,
        );
      }
    }
  }

  if (error) {
    console.error("[migrations] failed", error);
    process.exit(1);
  }

  if (closeConnection) {
    await closeDb();
  }
};

const isEntrypoint =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isEntrypoint) {
  await runMigrations({ closeConnection: true });
}
