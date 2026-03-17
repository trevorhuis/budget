import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const CategoryBase = z.object({
  name: z.string(),
  type: z.enum(["income", "expense"]),
  status: z.enum(["active", "inactive"]),
});

const CategoryRelations = z.object({
  userId: IdSchema,
});

export const CategorySchema = z.object({
  id: IdSchema,
  ...CategoryBase.shape,
  ...CategoryRelations.shape,
  ...DatetimeSchema.shape,
});

export const UpdateCategorySchema = CategoryBase;
export const InsertCategorySchema = CategoryBase.extend({
  id: IdSchema,
  ...CategoryRelations.shape,
});

export type Category = z.infer<typeof CategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type InsertCategory = z.infer<typeof InsertCategorySchema>;
