import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import accountRouter from "./api/account.router.js";
import bucketRouter from "./api/bucket.router.js";
import budgetRouter from "./api/budget.router.js";
import categoryRouter from "./api/category.router.js";
import budgetItemRouter from "./api/budgetItem.router.js";
import transactionRecurringRouter from "./api/transactionRecurring.router.js";
import transactionRouter from "./api/transaction.router.js";

export const app = new Hono().basePath("/api");
app.use(logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/accounts", accountRouter);
app.route("/buckets", bucketRouter);
app.route("/budgets", budgetRouter);
app.route("/categories", categoryRouter);
app.route("/budgetItems", budgetItemRouter);
app.route("/transactions/recurring", transactionRecurringRouter);
app.route("/transactions", transactionRouter);

app.get("/health", (c: Context) => c.text("OK!"));

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
