import { BudgetSchema, InsertBudgetSchema, UpdateBudgetSchema } from "./budget.model.js"

/** @typedef {import("./budget.model.js").Budget} Budget */
/** @typedef {import("./budget.model.js").InsertBudget} InsertBudget */
/** @typedef {import("./budget.model.js").UpdateBudget} UpdateBudget */
/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateBudgetSchema = async (data) => {
    const result = await BudgetSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertBudgetSchema = async (data) => {
    const result = await InsertBudgetSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateBudgetSchema = async (data) => {
    const result = await UpdateBudgetSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
