import * as z from "zod";
import {
  IdSchema,
  RecurringTransactionBase,
  RecurringTransactionSchema,
} from "schemas";

export const UpdateRecurringTransactionSchema = RecurringTransactionBase.omit({
  userId: true,
}).partial();
export const InsertRecurringTransactionSchema = RecurringTransactionBase.extend(
  {
    id: IdSchema,
  },
);

export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;
export type UpdateRecurringTransaction = z.infer<
  typeof UpdateRecurringTransactionSchema
>;
export type InsertRecurringTransaction = z.infer<
  typeof InsertRecurringTransactionSchema
>;
