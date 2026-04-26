import { db } from "../db/database.js";

const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const startSessionCleanup = () => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const runCleanup = async () => {
    try {
      const result = await db
        .deleteFrom("authSessions")
        .where("expiresAt", "<", new Date())
        .executeTakeFirst();

      const deletedCount = Number(result.numDeletedRows ?? 0);

      if (deletedCount > 0) {
        console.log(
          `[session-cleanup] Removed ${deletedCount} expired session(s)`,
        );
      }
    } catch (error) {
      console.error("[session-cleanup] Failed to clean up expired sessions:",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  // Run once on startup, then on interval
  void runCleanup();
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);
};
