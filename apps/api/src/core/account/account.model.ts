import { AccountBase, AccountSchema, IdSchema } from "schemas";
import * as z from "zod";

export const UpdateAccountSchema = AccountBase.omit({
  userId: true,
});
export const InsertAccountSchema = AccountBase.extend({
  id: IdSchema,
});

export type Account = z.infer<typeof AccountSchema>;
export type InsertAccount = z.infer<typeof InsertAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
