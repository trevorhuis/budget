import { BucketBase, IdSchema } from "schemas";
import * as z from "zod";

export const UpdateBucketSchema = BucketBase;
export const InsertBucketSchema = BucketBase.extend({
  id: IdSchema,
});

export type UpdateBucket = z.infer<typeof UpdateBucketSchema>;
export type InsertBucket = z.infer<typeof InsertBucketSchema>;
