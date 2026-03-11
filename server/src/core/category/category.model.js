import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const CategoryBase = z.object({
    name: z.string(),
    type: z.enum(["income", "expense"]),
    status: z.enum(["active", "inactive"]),
})

const CategoryRelations = z.object({
    userId: IdSchema,
})

export const CategorySchema = z.object({
    id: IdSchema,
    ...CategoryBase.shape,
    ...CategoryRelations.shape,
    ...DatetimeSchema.shape
})

export const UpdateCategorySchema = CategoryBase
export const InsertCategorySchema = CategoryBase.extend({
    id: IdSchema,
    ...CategoryRelations.shape,
})

/** @typedef {z.infer<typeof CategorySchema>} Category */
/** @typedef {z.infer<typeof UpdateCategorySchema>} UpdateCategory */
/** @typedef {z.infer<typeof InsertCategorySchema>} InsertCategory */
