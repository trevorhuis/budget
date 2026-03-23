import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import accountRouter from "./api/account.router.js";
import budgetRouter from "./api/budget.router.js";
import categoryRouter from "./api/category.router.js";
import budgetItemRouter from "./api/budgetItem.router.js";
import chatRouter from "./api/chat.router.js";
import calculatorRouter from "./api/calculator.router.js";
import recurringTransactionRouter from "./api/transactionRecurring.router.js";
import transactionRouter from "./api/transaction.router.js";
import { auth } from "./lib/auth.js";

const vercelPreviewHostPattern = /^[a-z0-9-]+\.vercel\.app$/i;

const isAllowedWebOrigin = (origin: string) => {
  if (origin === "http://localhost:5173") {
    return true;
  }

  try {
    const url = new URL(origin);

    return (
      url.protocol === "https:" && vercelPreviewHostPattern.test(url.hostname)
    );
  } catch {
    return false;
  }
};

export const app = new Hono().basePath("/api");
app.use(logger());
app.use(
  "*",
  cors({
    origin: (origin) => (isAllowedWebOrigin(origin) ? origin : null),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

app.route("/accounts", accountRouter);
app.route("/budgets", budgetRouter);
app.route("/categories", categoryRouter);
app.route("/budgetItems", budgetItemRouter);
app.route("/calculators", calculatorRouter);
app.route("/chat", chatRouter);
app.route("/transactions/recurring", recurringTransactionRouter);
app.route("/transactions", transactionRouter);

app.get("/health", (c: Context) => c.text("OK!"));

export default app;

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
