import * as z from "zod/mini";
import { AccountBase, AccountSchema, IdSchema } from "../../schemas.js";

export const UpdateAccountSchema = z.omit(AccountBase, {
  userId: true,
});
export const InsertAccountSchema = z.extend(AccountBase, {
  id: IdSchema,
});

export type Account = z.infer<typeof AccountSchema>;
export type InsertAccount = z.infer<typeof InsertAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
