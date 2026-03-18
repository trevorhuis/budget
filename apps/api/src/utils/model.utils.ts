import * as z from "zod";

export const DatetimeSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const IdSchema = z.uuidv7();
