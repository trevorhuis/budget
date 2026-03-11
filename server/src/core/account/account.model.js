import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const AccountBase = z.object({
    name: z.string(),
    type: z.enum(["savings", "checking", "credit"]),
    balance: z.number(),
})

const AccountRelations = z.object({
    userId: IdSchema
})

export const AccountSchema = z.object({
    id: IdSchema,
    ...AccountBase.shape,
    ...AccountRelations.shape,
    ...DatetimeSchema.shape
})

export const UpdateAccountSchema = AccountBase
export const InsertAccountSchema = AccountBase.extend({
    id: IdSchema,
    ...AccountRelations.shape,
})

/** @typedef {z.infer<typeof AccountSchema>} Account */
/** @typedef {z.infer<typeof UpdateAccountSchema>} UpdateAccount */
/** @typedef {z.infer<typeof InsertAccountSchema>} InsertAccount */
