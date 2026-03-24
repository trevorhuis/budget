import * as z from "zod/mini";
import { CategoryBase, CategorySchema, IdSchema } from "../../schemas.js";

export const UpdateCategorySchema = z.omit(CategoryBase, {
  userId: true,
});
export const InsertCategorySchema = z.extend(CategoryBase, {
  id: IdSchema,
});

export type Category = z.infer<typeof CategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type InsertCategory = z.infer<typeof InsertCategorySchema>;
