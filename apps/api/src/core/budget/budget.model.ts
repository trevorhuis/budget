import * as z from "zod";
import { BudgetBase, BudgetSchema, IdSchema } from "schemas";

export const UpdateBudgetSchema = BudgetBase.omit({
  userId: true,
});
export const InsertBudgetSchema = BudgetBase.extend({
  id: IdSchema,
});

export type Budget = z.infer<typeof BudgetSchema>;
export type UpdateBudget = z.infer<typeof UpdateBudgetSchema>;
export type InsertBudget = z.infer<typeof InsertBudgetSchema>;
