import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const TransactionBase = z.object({
    merchant: z.string(),
    amount: z.number(),
    notes: z.string(),
    date: z.date()
})

const TransactionRelations = z.object({
    userId: IdSchema,
    accountId: IdSchema,
    budgetId: IdSchema,
    categoryId: IdSchema,
    recurringTemplateId: IdSchema,
})

export const TransactionSchema = z.object({
    id: IdSchema,
    ...TransactionBase.shape,
    ...TransactionRelations.shape,
    ...DatetimeSchema.shape
})

export const UpdateTransactionSchema = TransactionBase
export const InsertTransactionSchema = TransactionBase.extend({
    id: IdSchema,
    ...TransactionRelations.shape,
})

/** @typedef {z.infer<typeof TransactionSchema>} Transaction */
/** @typedef {z.infer<typeof UpdateTransactionSchema>} UpdateTransaction */
/** @typedef {z.infer<typeof InsertTransactionSchema>} InsertTransaction */
