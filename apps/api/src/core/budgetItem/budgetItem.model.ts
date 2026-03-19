import * as z from "zod";
import { BudgetItemBase, BudgetItemSchema, IdSchema } from "schemas";

export const UpdateBudgetItemSchema = BudgetItemBase;
export const InsertBudgetItemSchema = BudgetItemBase.extend({
  id: IdSchema,
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type UpdateBudgetItem = z.infer<typeof UpdateBudgetItemSchema>;
export type InsertBudgetItem = z.infer<typeof InsertBudgetItemSchema>;
