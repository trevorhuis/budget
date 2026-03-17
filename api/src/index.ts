import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { fileURLToPath } from "node:url";

import accountRouter from "./api/account.router.js";
import bucketRouter from "./api/bucket.router.js";
import budgetRouter from "./api/budget.router.js";
import categoryRouter from "./api/category.router.js";
import budgetItemRouter from "./api/budgetItem.router.js";
import transactionRecurringRouter from "./api/transactionRecurring.router.js";
import transactionRouter from "./api/transaction.router.js";

export const createApp = () => {
  const app = new Hono().basePath("/api");
  app.use(logger());

  app.route("/accounts", accountRouter);
  app.route("/buckets", bucketRouter);
  app.route("/budgets", budgetRouter);
  app.route("/categories", categoryRouter);
  app.route("/budgetItems", budgetItemRouter);
  app.route("/transactions/recurring", transactionRecurringRouter);
  app.route("/transactions", transactionRouter);

  app.get("/health", (c) => c.text("OK!"));

  return app;
};

export const app = createApp();

const isEntrypoint =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isEntrypoint) {
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
}
