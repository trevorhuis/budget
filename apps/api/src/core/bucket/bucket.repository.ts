import { db } from "../../db/database.js";
import {
  type Bucket,
  type InsertBucket,
  type UpdateBucket,
} from "./bucket.model.js";

export const getBucketsByUser = async (userId: string): Promise<Bucket[]> => {
  return await db
    .selectFrom("buckets")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
};

export const getBucketByUserAndId = async (
  userId: string,
  bucketId: string,
): Promise<Bucket | null> => {
  const bucket = await db
    .selectFrom("buckets")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", bucketId)
    .executeTakeFirst();

  return bucket ?? null;
};

export const getBucketById = async (
  bucketId: string,
): Promise<Bucket | null> => {
  const bucket = await db
    .selectFrom("buckets")
    .selectAll()
    .where("id", "=", bucketId)
    .executeTakeFirst();

  return bucket ?? null;
};

export const insertBucket = async (bucketData: InsertBucket): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("buckets")
    .values({
      ...bucketData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateBucket = async (
  bucketId: string,
  bucket: UpdateBucket,
): Promise<void> => {
  await db
    .updateTable("buckets")
    .set({
      name: bucket.name,
      goal: bucket.goal,
      current: bucket.current,
      updatedAt: new Date(),
    })
    .where("id", "=", bucketId)
    .execute();
};

export const deleteBucket = async (bucketId: string): Promise<void> => {
  await db.deleteFrom("buckets").where("id", "=", bucketId).execute();
};
