import type { InsertBucket, UpdateBucket } from "./bucket.model.js";
import {
  getBucketById,
  getBucketsByUser,
  insertBucket,
  updateBucket,
  deleteBucket,
} from "./bucket.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createBucket = async (bucket: InsertBucket) => {
  await insertBucket(bucket);
  return true;
};

export const readBucketsFromUser = async (userId: string) => {
  return await getBucketsByUser(userId);
};

export const bucketUpdate = async (
  userId: string,
  bucketId: string,
  bucket: UpdateBucket,
) => {
  const foundBucket = await getBucketById(bucketId);
  if (!foundBucket) {
    throw new NotFoundException("Bucket not found");
  }
  if (foundBucket.userId !== userId) {
    throw new AccessDeniedException("Bucket ownership mismatch");
  }

  await updateBucket(bucketId, bucket);
  return true;
};

export const removeBucket = async (userId: string, bucketId: string) => {
  const foundBucket = await getBucketById(bucketId);
  if (!foundBucket) {
    throw new NotFoundException("Bucket not found");
  }
  if (foundBucket.userId !== userId) {
    throw new AccessDeniedException("Bucket ownership mismatch");
  }

  await deleteBucket(bucketId);
  return true;
};
