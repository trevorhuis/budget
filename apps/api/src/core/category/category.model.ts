import * as z from "zod";
import { CategoryBase, CategorySchema, IdSchema } from "schemas";

export const UpdateCategorySchema = CategoryBase;
export const InsertCategorySchema = CategoryBase.extend({
  id: IdSchema,
});

export type Category = z.infer<typeof CategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type InsertCategory = z.infer<typeof InsertCategorySchema>;
