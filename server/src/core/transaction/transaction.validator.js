import { TransactionSchema, InsertTransactionSchema, UpdateTransactionSchema } from "./transaction.model.js"

/** @typedef {import("./transaction.model.js").Transaction} Transaction */
/** @typedef {import("./transaction.model.js").InsertTransaction} InsertTransaction */
/** @typedef {import("./transaction.model.js").UpdateTransaction} UpdateTransaction */
/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateTransactionSchema = async (data) => {
    const result = await TransactionSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertTransactionSchema = async (data) => {
    const result = await InsertTransactionSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateTransactionSchema = async (data) => {
    const result = await UpdateTransactionSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
