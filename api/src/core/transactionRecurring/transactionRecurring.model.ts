import * as z from "zod/mini";
import {
  IdSchema,
  RecurringTransactionBase,
  RecurringTransactionSchema,
} from "../../schemas.js";

export const UpdateRecurringTransactionSchema = z.partial(
  z.omit(RecurringTransactionBase, {
    userId: true,
  }),
);
export const InsertRecurringTransactionSchema = z.extend(
  RecurringTransactionBase,
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
