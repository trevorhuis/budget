import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";
import * as z from "zod/mini";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { validateString } from "../utils/validator.utils.js";
import {
  InsertCalculatorSchema,
  UpdateCalculatorSchema,
} from "../core/calculator/calculator.model.js";
import {
  calculatorUpdate,
  createCalculator,
  duplicateCalculator,
  readCalculatorFromUser,
  readCalculatorsFromUser,
  readSharedCalculator,
  removeCalculator,
  shareCalculator,
  unshareCalculator,
} from "../core/calculator/calculator.useCase.js";
import { AccessDeniedException, NotFoundException } from "../errors.js";

const calculatorRouter = new Hono();

const handleCalculatorError = (error: unknown, c: Context) => {
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
};

calculatorRouter.get("/shared/:shareToken", async (c) => {
  try {
    const shareToken = z
      .string()
      .check(z.trim(), z.minLength(1))
      .parse(c.req.param("shareToken"));
    const calculator = await readSharedCalculator(shareToken);

    return c.json({ data: calculator }, 200);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

calculatorRouter.get("/", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const calculators = await readCalculatorsFromUser(userId);
    return c.json({ data: calculators }, 200);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

calculatorRouter.get("/:calculatorId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const calculatorId = await validateString(c.req.param("calculatorId"));
    const calculator = await readCalculatorFromUser(userId, calculatorId);

    return c.json({ data: calculator }, 200);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

calculatorRouter.post(
  "/",
  userMiddleware,
  zValidator(
    "json",
    z.omit(InsertCalculatorSchema, { userId: true, shareToken: true }),
  ),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const data = c.req.valid("json");
      await createCalculator({
        ...data,
        userId,
      });

      return c.json({ success: true }, 201);
    } catch (error) {
      return handleCalculatorError(error, c);
    }
  },
);

calculatorRouter.put(
  "/:calculatorId",
  userMiddleware,
  zValidator("json", UpdateCalculatorSchema),
  async (c) => {
    const userId = await getAuthenticatedUserId(c.var.userId);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const calculatorId = await validateString(c.req.param("calculatorId"));
      const data = c.req.valid("json");

      await calculatorUpdate(userId, calculatorId, data);

      return c.json({ success: true }, 200);
    } catch (error) {
      return handleCalculatorError(error, c);
    }
  },
);

calculatorRouter.post("/:calculatorId/duplicate", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const calculatorId = await validateString(c.req.param("calculatorId"));
    const calculator = await duplicateCalculator(userId, calculatorId);

    return c.json({ data: calculator }, 201);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

calculatorRouter.post("/:calculatorId/share", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const calculatorId = await validateString(c.req.param("calculatorId"));
    const shareToken = await shareCalculator(userId, calculatorId);

    return c.json({ data: { shareToken } }, 200);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

calculatorRouter.delete("/:calculatorId/share", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const calculatorId = await validateString(c.req.param("calculatorId"));
    await unshareCalculator(userId, calculatorId);

    return c.json({ success: true }, 200);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

calculatorRouter.delete("/:calculatorId", userMiddleware, async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const calculatorId = await validateString(c.req.param("calculatorId"));
    await removeCalculator(userId, calculatorId);

    return c.json({ data: { calculatorId } }, 200);
  } catch (error) {
    return handleCalculatorError(error, c);
  }
});

export default calculatorRouter;
