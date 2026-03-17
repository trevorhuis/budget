import * as z from "zod";
import { DatetimeSchema, IdSchema } from "../../utils/model.utils.js";

const BucketBase = z.object({
  name: z.string(),
  goal: z.number(),
  current: z.number(),
});

const BucketRelations = z.object({
  userId: IdSchema,
});

export const BucketSchema = z.object({
  id: IdSchema,
  ...BucketBase.shape,
  ...BucketRelations.shape,
  ...DatetimeSchema.shape,
});

export const UpdateBucketSchema = BucketBase;
export const InsertBucketSchema = BucketBase.extend({
  id: IdSchema,
  ...BucketRelations.shape,
});

export type Bucket = z.infer<typeof BucketSchema>;
export type UpdateBucket = z.infer<typeof UpdateBucketSchema>;
export type InsertBucket = z.infer<typeof InsertBucketSchema>;
