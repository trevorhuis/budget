import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const BudgetItemBase = z.object({
  name: z.string(),
  allocatedAmount: z.number(),
  actualAmount: z.number(),
});

const BudgetItemRelations = z.object({
  budgetId: IdSchema,
  categoryId: IdSchema,
});

export const BudgetItemSchema = z.object({
  id: IdSchema,
  ...BudgetItemBase.shape,
  ...BudgetItemRelations.shape,
  ...DatetimeSchema.shape,
});

export const UpdateBudgetItemSchema = BudgetItemBase;
export const InsertBudgetItemSchema = BudgetItemBase.extend({
  id: IdSchema,
  ...BudgetItemRelations.shape,
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type UpdateBudgetItem = z.infer<typeof UpdateBudgetItemSchema>;
export type InsertBudgetItem = z.infer<typeof InsertBudgetItemSchema>;
