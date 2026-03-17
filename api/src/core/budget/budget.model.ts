import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const BudgetBase = z.object({
  month: z.number(),
  year: z.number(),
});

const BudgetRelations = z.object({
  userId: IdSchema,
});

export const BudgetSchema = z.object({
  id: IdSchema,
  ...BudgetBase.shape,
  ...BudgetRelations.shape,
  ...DatetimeSchema.shape,
});

export const UpdateBudgetSchema = BudgetBase;
export const InsertBudgetSchema = BudgetBase.extend({
  id: IdSchema,
  ...BudgetRelations.shape,
});

export type Budget = z.infer<typeof BudgetSchema>;
export type UpdateBudget = z.infer<typeof UpdateBudgetSchema>;
export type InsertBudget = z.infer<typeof InsertBudgetSchema>;
