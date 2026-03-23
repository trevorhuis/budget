import * as z from "zod";
import { IdSchema, TransactionBase, TransactionSchema } from "schemas";

export const UpdateTransactionSchema = TransactionBase.omit({
  userId: true,
}).partial();
export const InsertTransactionSchema = TransactionBase.extend({
  id: IdSchema,
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type InsertTransaction = z.infer<typeof InsertTransactionSchema>;
