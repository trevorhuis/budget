import { AccountBase, IdSchema } from "schemas";
import * as z from "zod";

export const UpdateAccountSchema = AccountBase;
export const InsertAccountSchema = AccountBase.extend({
  id: IdSchema,
});

export type InsertAccount = z.infer<typeof InsertAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
