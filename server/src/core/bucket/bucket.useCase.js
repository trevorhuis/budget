/** @typedef {import("./bucket.model.js").Bucket} Bucket */
/** @typedef {import("./bucket.model.js").InsertBucket} InsertBucket */
/** @typedef {import("./bucket.model.js").UpdateBucket} UpdateBucket */

/**
 * @param {InsertBucket} bucket - Bucket object to create
 * @returns {boolean} true if successful
 */
export function createBucket(bucket) {
    console.log(bucket)
    return true
}

/**
 * @param {string} bucketId - Bucket id to read
 * @returns {Bucket | null} Bucket
 */
export function readBucket(bucketId) {
    console.log(bucketId)
    return null
}

/**
 * @param {string} userId - Owner user id
 * @returns {Bucket[]} Buckets for user
 */
export function readBucketsFromUser(userId) {
    console.log(userId)
    return []
}

/**
 * @param {UpdateBucket} bucket - Updated bucket object
 * @returns {boolean} true if successful
 */
export function updateBucket(bucket) {
    console.log(bucket)
    return true
}

/**
 * @param {string} bucketId - id to delete
 * @returns {boolean} true if successful
 */
export function deleteBucket(bucketId) {
    console.log(bucketId)
    return true
}
