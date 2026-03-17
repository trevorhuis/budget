import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import { InsertCategorySchema, UpdateCategorySchema } from "../core/category/category.model.js";
import { createCategory, readCategoriesFromUser, categoryUpdate, removeCategory } from "../core/category/category.useCase.js";
import { NotFoundException, AccessDeniedException } from "../errors.js";

const categoryRouter = new Hono();

categoryRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const categories = await readCategoriesFromUser(userId);
    return c.json({ data: categories }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

categoryRouter.post("/", userMiddleware, zValidator("json", InsertCategorySchema.omit({ userId: true })), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const data = c.req.valid("json");
    await createCategory({ ...data, userId });

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

categoryRouter.put("/:categoryId", userMiddleware, zValidator("json", UpdateCategorySchema), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const categoryId = await validateString(c.req.param("categoryId"));
    const data = c.req.valid("json");

    await categoryUpdate(userId, categoryId, data);

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

categoryRouter.delete("/:categoryId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const categoryId = await validateString(c.req.param("categoryId"));

    await removeCategory(userId, categoryId);

    return c.json({ data: { categoryId } }, 200);
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

export default categoryRouter;
