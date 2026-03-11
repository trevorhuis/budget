import * as z from "zod";

export const DatetimeSchema = z.object({
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
})

export const IdSchema = z.uuidv7()