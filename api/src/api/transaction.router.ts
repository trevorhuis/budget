import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import { InsertTransactionSchema, UpdateTransactionSchema } from "../core/transaction/transaction.model.js";
import {
  createTransaction,
  readTransactionsFromUser,
  transactionUpdate,
  removeTransaction,
} from "../core/transaction/transaction.useCase.js";
import { NotFoundException, AccessDeniedException } from "../errors.js";

const transactionRouter = new Hono();

transactionRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const transactions = await readTransactionsFromUser(userId);
    return c.json({ data: transactions }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

transactionRouter.post("/", userMiddleware, zValidator("json", InsertTransactionSchema.omit({ userId: true })), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const data = c.req.valid("json");
    await createTransaction({ ...data, userId });

    return c.json({ success: true }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: error.issues }, 400);
    }
    if (error instanceof NotFoundException) {
      return c.json({ error: "Not found" }, 404);
    }
    if (error instanceof AccessDeniedException) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ message: "Server error" }, 500);
  }
});

transactionRouter.put("/:transactionId", userMiddleware, zValidator("json", UpdateTransactionSchema), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const transactionId = await validateString(c.req.param("transactionId"));
    const data = c.req.valid("json");

    await transactionUpdate(userId, transactionId, data);

    return c.json({ success: true }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }
    if (error instanceof NotFoundException) {
      return c.json({ error: "Not found" }, 404);
    }
    if (error instanceof AccessDeniedException) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ message: "Server error" }, 500);
  }
});

transactionRouter.delete("/:transactionId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const transactionId = await validateString(c.req.param("transactionId"));

    await removeTransaction(userId, transactionId);

    return c.json({ data: { transactionId } }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }
    if (error instanceof NotFoundException) {
      return c.json({ error: "Not found" }, 404);
    }
    if (error instanceof AccessDeniedException) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

export default transactionRouter;
