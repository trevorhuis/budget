import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const TransactionRecurringBase = z.object({
    merchant: z.string(),
    amount: z.number(),
    notes: z.string()
})

const TransactionRecurringRelations = z.object({
    userId: IdSchema,
    categoryId: IdSchema
})

export const TransactionRecurringSchema = z.object({
    id: IdSchema,
    ...TransactionRecurringBase.shape,
    ...TransactionRecurringRelations.shape,
    ...DatetimeSchema.shape
})

export const UpdateTransactionRecurringSchema = TransactionRecurringBase
export const InsertTransactionRecurringSchema = TransactionRecurringBase.extend({
    id: IdSchema,
    ...TransactionRecurringRelations.shape,
})

/** @typedef {z.infer<typeof TransactionRecurringSchema>} TransactionRecurring */
/** @typedef {z.infer<typeof UpdateTransactionRecurringSchema>} UpdateTransactionRecurring */
/** @typedef {z.infer<typeof InsertTransactionRecurringSchema>} InsertTransactionRecurring */
