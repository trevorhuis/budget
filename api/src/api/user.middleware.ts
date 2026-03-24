import { createMiddleware } from "hono/factory";

import { auth, type AuthSession, type AuthUser } from "../lib/auth.js";
import type { Context } from "hono";
import type { Next } from "hono/types";

export const userMiddleware = createMiddleware<{
  Variables: {
    session: AuthSession["session"];
    authUser: AuthUser;
    userId: string;
  };
}>(async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("session", session.session);
    c.set("authUser", session.user);
    c.set("userId", session.user.id);

    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
