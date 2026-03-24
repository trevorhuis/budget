import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";
import * as z from "zod/mini";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import {
  InsertRecurringTransactionSchema,
  UpdateRecurringTransactionSchema,
} from "../core/transactionRecurring/transactionRecurring.model.js";
import {
  createRecurringTransaction,
  readRecurringFromUser,
  recurringTransactionUpdate,
  removeRecurringTransaction,
} from "../core/transactionRecurring/transactionRecurring.useCase.js";
import { NotFoundException, AccessDeniedException } from "../errors.js";

const recurringTransactionRouter = new Hono();

recurringTransactionRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const templates = await readRecurringFromUser(userId);
    return c.json({ data: templates }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

recurringTransactionRouter.post(
  "/",
  userMiddleware,
  zValidator(
    "json",
    z.omit(InsertRecurringTransactionSchema, { userId: true }),
  ),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = c.req.valid("json");
      await createRecurringTransaction({ ...data, userId });

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
  },
);

recurringTransactionRouter.put(
  "/:templateId",
  userMiddleware,
  zValidator("json", UpdateRecurringTransactionSchema),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const templateId = await validateString(c.req.param("templateId"));
      const data = c.req.valid("json");

      await recurringTransactionUpdate(userId, templateId, data);

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
  },
);

recurringTransactionRouter.delete("/:templateId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const templateId = await validateString(c.req.param("templateId"));

    await removeRecurringTransaction(userId, templateId);

    return c.json({ data: { templateId } }, 200);
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

export default recurringTransactionRouter;
