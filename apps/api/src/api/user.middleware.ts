import { createMiddleware } from "hono/factory";

export const userMiddleware = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const userIdHeader = c.req.header("x-user-id");

  if (process.env.NODE_ENV === "test" && userIdHeader !== undefined) {
    if (userIdHeader.trim() !== "" && userIdHeader !== "anonymous") {
      c.set("userId", userIdHeader);
    }

    await next();
    return;
  }

  c.set("userId", "019cf45e-80f5-714a-a121-bb32f8364813");
  await next();
});
