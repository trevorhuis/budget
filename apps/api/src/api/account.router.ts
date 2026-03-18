import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import {
  InsertAccountSchema,
  UpdateAccountSchema,
} from "../core/account/account.model.js";
import {
  accountUpdate,
  createAccount,
  readAccountsFromUser,
  removeAccount,
} from "../core/account/account.useCase.js";
import { NotFoundException, AccessDeniedException } from "../errors.js";

const accountRouter = new Hono();

accountRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const accounts = await readAccountsFromUser(userId);

    return c.json({ data: accounts }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json({ error: "Server error" }, 500);
  }
});

accountRouter.post(
  "/",
  userMiddleware,
  zValidator("json", InsertAccountSchema.omit({ userId: true })),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = c.req.valid("json");

      await createAccount({ ...data, userId });

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

accountRouter.delete("/:accountId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const accountId = await validateString(c.req.param("accountId"));

    await removeAccount(userId, accountId);

    return c.json({ data: { accountId } }, 200);
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

accountRouter.put(
  "/:accountId",
  userMiddleware,
  zValidator("json", UpdateAccountSchema),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = c.req.valid("json");
      const accountId = await validateString(c.req.param("accountId"));

      await accountUpdate(userId, accountId, data);

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

export default accountRouter;
