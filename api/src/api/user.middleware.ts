import { createMiddleware } from "hono/factory";

export const userMiddleware = createMiddleware<{ Variables: { userId: string } }>(
  async (c, next) => {
    c.set("userId", "019cf45e-80f5-714a-a121-bb32f8364813");
    await next();
  },
);
