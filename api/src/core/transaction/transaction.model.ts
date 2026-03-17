import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const TransactionBase = z.object({
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  date: z.coerce.date(),
});

const TransactionRelations = z.object({
  userId: IdSchema,
  accountId: IdSchema,
  budgetId: IdSchema,
  categoryId: IdSchema,
  recurringTemplateId: IdSchema.optional().nullable(),
});

export const TransactionSchema = z.object({
  id: IdSchema,
  ...TransactionBase.shape,
  ...TransactionRelations.shape,
  ...DatetimeSchema.shape,
});

export const UpdateTransactionSchema = TransactionBase;
export const InsertTransactionSchema = TransactionBase.extend({
  id: IdSchema,
  ...TransactionRelations.shape,
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type InsertTransaction = z.infer<typeof InsertTransactionSchema>;
