import * as z from "zod";
import { BudgetBase, IdSchema } from "schemas";

export const UpdateBudgetSchema = BudgetBase;
export const InsertBudgetSchema = BudgetBase.extend({
  id: IdSchema,
});

export type UpdateBudget = z.infer<typeof UpdateBudgetSchema>;
export type InsertBudget = z.infer<typeof InsertBudgetSchema>;
