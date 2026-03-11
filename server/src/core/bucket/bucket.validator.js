import { BucketSchema, InsertBucketSchema, UpdateBucketSchema } from "./bucket.model.js"

/** @typedef {import("./bucket.model.js").Bucket} Bucket */
/** @typedef {import("./bucket.model.js").InsertBucket} InsertBucket */
/** @typedef {import("./bucket.model.js").UpdateBucket} UpdateBucket */
/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateBucketSchema = async (data) => {
    const result = await BucketSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertBucketSchema = async (data) => {
    const result = await InsertBucketSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateBucketSchema = async (data) => {
    const result = await UpdateBucketSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
