import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const BudgetBase = z.object({
    month: z.number(),
    year: z.number(),
})

const BudgetRelations = z.object({
    userId: IdSchema
})

export const BudgetSchema = z.object({
    id: IdSchema,
    ...BudgetBase.shape,
    ...BudgetRelations.shape,
    ...DatetimeSchema.shape
})

export const UpdateBudgetSchema = BudgetBase
export const InsertBudgetSchema = BudgetBase.extend({
    id: IdSchema,
    ...BudgetRelations.shape,
})

/** @typedef {z.infer<typeof BudgetSchema>} Budget */
/** @typedef {z.infer<typeof UpdateBudgetSchema>} UpdateBudget */
/** @typedef {z.infer<typeof InsertBudgetSchema>} InsertBudget */
