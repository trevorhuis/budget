import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import { InsertBudgetItemSchema, UpdateBudgetItemSchema } from "../core/budgetItem/budgetItem.model.js";
import { createBudgetItem, readBudgetItemsFromUser, budgetItemUpdate, removeBudgetItem } from "../core/budgetItem/budgetItem.useCase.js";
import { NotFoundException, AccessDeniedException } from "../errors.js";

const budgetItemRouter = new Hono();

budgetItemRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const budgetItems = await readBudgetItemsFromUser(userId);
    return c.json({ data: budgetItems }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

budgetItemRouter.post("/", userMiddleware, zValidator("json", InsertBudgetItemSchema), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const data = c.req.valid("json");
    await createBudgetItem(data, userId);

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

budgetItemRouter.put("/:budgetItemId", userMiddleware, zValidator("json", UpdateBudgetItemSchema), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const budgetItemId = await validateString(c.req.param("budgetItemId"));
    const data = c.req.valid("json");

    await budgetItemUpdate(userId, budgetItemId, data);

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

budgetItemRouter.delete("/:budgetItemId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const budgetItemId = await validateString(c.req.param("budgetItemId"));

    await removeBudgetItem(userId, budgetItemId);

    return c.json({ data: { budgetItemId } }, 200);
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

export default budgetItemRouter;
