import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";
import * as z from "zod/mini";
import { BulkTransactionCommitRequestSchema } from "../schemas.js";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import {
  InsertTransactionSchema,
  UpdateTransactionSchema,
} from "../core/transaction/transaction.model.js";
import {
  createTransaction,
  readTransactionsFromUser,
  transactionUpdate,
  removeTransaction,
} from "../core/transaction/transaction.useCase.js";
import {
  BulkPreviewTooLargeError,
  BulkPreviewValidationError,
  commitBulkTransactions,
  createBulkTransactionPreview,
} from "../core/transaction/transactionBulk.useCase.js";
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

transactionRouter.post("/bulk/preview", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const formData = await c.req.raw.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return c.json({ error: "CSV file is required" }, 400);
    }

    const preview = await createBulkTransactionPreview(userId, file);
    return c.json({ data: preview }, 200);
  } catch (error) {
    if (error instanceof BulkPreviewTooLargeError) {
      return c.json({ error: error.message }, 413);
    }
    if (error instanceof BulkPreviewValidationError) {
      return c.json({ error: error.message }, 400);
    }
    if (error instanceof ZodError) {
      return c.json({ error: error.issues }, 400);
    }

    return c.json(
      {
        error: error instanceof Error ? error.message : "Unable to preview CSV",
      },
      500,
    );
  }
});

transactionRouter.post(
  "/bulk",
  userMiddleware,
  zValidator("json", BulkTransactionCommitRequestSchema),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = c.req.valid("json");
      const result = await commitBulkTransactions(userId, data);

      return c.json({ data: result }, 201);
    } catch (error) {
      if (error instanceof BulkPreviewValidationError) {
        return c.json({ error: error.message }, 400);
      }
      if (error instanceof ZodError) {
        return c.json({ error: error.issues }, 400);
      }
      if (error instanceof NotFoundException) {
        return c.json({ error: error.message }, 404);
      }
      if (error instanceof AccessDeniedException) {
        return c.json({ error: error.message }, 403);
      }

      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to commit bulk rows",
        },
        500,
      );
    }
  },
);

transactionRouter.post(
  "/",
  userMiddleware,
  zValidator("json", z.omit(InsertTransactionSchema, { userId: true })),
  async (c) => {
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
  },
);

transactionRouter.put(
  "/:transactionId",
  userMiddleware,
  zValidator("json", UpdateTransactionSchema),
  async (c) => {
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
  },
);

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
