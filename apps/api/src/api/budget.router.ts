import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import {
  InsertBudgetSchema,
  UpdateBudgetSchema,
} from "../core/budget/budget.model.js";
import {
  createBudget,
  readBudgetsFromUser,
  budgetUpdate,
  removeBudget,
} from "../core/budget/budget.useCase.js";
import { NotFoundException, AccessDeniedException } from "../errors.js";

const budgetRouter = new Hono();

budgetRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const budgets = await readBudgetsFromUser(userId);
    return c.json({ data: budgets }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

budgetRouter.post(
  "/",
  userMiddleware,
  zValidator("json", InsertBudgetSchema.omit({ userId: true })),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = c.req.valid("json");
      await createBudget({ ...data, userId });

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

budgetRouter.put(
  "/:budgetId",
  userMiddleware,
  zValidator("json", UpdateBudgetSchema),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const budgetId = await validateString(c.req.param("budgetId"));
      const data = c.req.valid("json");

      await budgetUpdate(userId, budgetId, data);

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

budgetRouter.delete("/:budgetId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const budgetId = await validateString(c.req.param("budgetId"));

    await removeBudget(userId, budgetId);

    return c.json({ data: { budgetId } }, 200);
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

export default budgetRouter;
