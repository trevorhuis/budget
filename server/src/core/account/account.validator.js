import { AccountSchema, InsertAccountSchema, UpdateAccountSchema } from "./account.model.js"

/** @typedef {import("./account.model.js").Account} Account */
/** @typedef {import("./account.model.js").InsertAccount} InsertAccount */
/** @typedef {import("./account.model.js").UpdateAccount} UpdateAccount */

/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateAccountSchema = async (data) => {
    const result = await AccountSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertAccountSchema = async (data) => {
    const result = await InsertAccountSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateAccountSchema = async (data) => {
    const result = await UpdateAccountSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
