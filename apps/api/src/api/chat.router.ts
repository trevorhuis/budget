import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodError } from "zod";

import { userMiddleware } from "./user.middleware.js";
import { getAuthenticatedUserId } from "../utils/auth.utils.js";
import { ChatRequestSchema, createChatResponse } from "../core/chat/chat.js";

const chatRouter = new Hono();

chatRouter.post("/", userMiddleware, zValidator("json", ChatRequestSchema), async (c) => {
  const userId = await getAuthenticatedUserId(c.var.userId);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = c.req.valid("json");
    return await createChatResponse(c.req.raw, body, userId);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Bad input value" }, 400);
    }

    return c.json(
      {
        error:
          error instanceof Error ? error.message : "An error occurred",
      },
      500,
    );
  }
});

export default chatRouter;
