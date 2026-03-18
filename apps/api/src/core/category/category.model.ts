import * as z from "zod";
import { CategoryBase, IdSchema } from "schemas";

export const UpdateCategorySchema = CategoryBase;
export const InsertCategorySchema = CategoryBase.extend({
  id: IdSchema,
});

export type UpdateCategory = z.infer<typeof CategoryBase>;
export type InsertCategory = z.infer<typeof InsertCategorySchema>;
