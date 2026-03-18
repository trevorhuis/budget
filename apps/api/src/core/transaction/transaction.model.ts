import * as z from "zod";
import { TransactionBase, IdSchema } from "schemas"

export const UpdateTransactionSchema = TransactionBase;
export const InsertTransactionSchema = TransactionBase.extend({
  id: IdSchema,
});

export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type InsertTransaction = z.infer<typeof InsertTransactionSchema>;
