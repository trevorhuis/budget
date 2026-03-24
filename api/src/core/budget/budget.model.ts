import * as z from "zod/mini";
import { BudgetBase, BudgetSchema, IdSchema } from "../../schemas.js";

export const UpdateBudgetSchema = z.omit(BudgetBase, {
  userId: true,
});
export const InsertBudgetSchema = z.extend(BudgetBase, {
  id: IdSchema,
});

export type Budget = z.infer<typeof BudgetSchema>;
export type UpdateBudget = z.infer<typeof UpdateBudgetSchema>;
export type InsertBudget = z.infer<typeof InsertBudgetSchema>;
