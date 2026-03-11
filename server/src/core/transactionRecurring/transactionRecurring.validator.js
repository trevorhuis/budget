import { TransactionRecurringSchema, InsertTransactionRecurringSchema, UpdateTransactionRecurringSchema } from "./transactionRecurring.model.js"

/** @typedef {import("./transactionRecurring.model.js").TransactionRecurring} TransactionRecurring */
/** @typedef {import("./transactionRecurring.model.js").InsertTransactionRecurring} InsertTransactionRecurring */
/** @typedef {import("./transactionRecurring.model.js").UpdateTransactionRecurring} UpdateTransactionRecurring */
/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateTransactionRecurringSchema = async (data) => {
    const result = await TransactionRecurringSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertTransactionRecurringSchema = async (data) => {
    const result = await InsertTransactionRecurringSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateTransactionRecurringSchema = async (data) => {
    const result = await UpdateTransactionRecurringSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
