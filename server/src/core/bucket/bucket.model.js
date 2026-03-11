import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const BucketBase = z.object({
    name: z.string(),
    goal: z.number(),
    current: z.number(),
})

const BucketRelations = z.object({
    userId: IdSchema
})

export const BucketSchema = z.object({
    id: IdSchema,
    ...BucketBase.shape,
    ...BucketRelations.shape,
    ...DatetimeSchema.shape
})

export const UpdateBucketSchema = BucketBase
export const InsertBucketSchema = BucketBase.extend({
    id: IdSchema,
    ...BucketRelations.shape,
})

/** @typedef {z.infer<typeof BucketSchema>} Bucket */
/** @typedef {z.infer<typeof UpdateBucketSchema>} UpdateBucket */
/** @typedef {z.infer<typeof InsertBucketSchema>} InsertBucket */
