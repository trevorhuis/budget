import * as z from "zod/mini";
import { IdSchema, TransactionBase, TransactionSchema } from "../../schemas.js";

export const UpdateTransactionSchema = z.partial(
  z.omit(TransactionBase, {
    userId: true,
  }),
);
export const InsertTransactionSchema = z.extend(TransactionBase, {
  id: IdSchema,
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type InsertTransaction = z.infer<typeof InsertTransactionSchema>;
