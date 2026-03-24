import * as z from "zod/mini";
import { BudgetItemBase, BudgetItemSchema, IdSchema } from "../../schemas.js";

export const UpdateBudgetItemSchema = z.partial(
  z.pick(BudgetItemBase, {
    actualAmount: true,
    targetAmount: true,
  }),
);
export const InsertBudgetItemSchema = z.extend(BudgetItemBase, {
  id: IdSchema,
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type UpdateBudgetItem = z.infer<typeof UpdateBudgetItemSchema>;
export type InsertBudgetItem = z.infer<typeof InsertBudgetItemSchema>;
