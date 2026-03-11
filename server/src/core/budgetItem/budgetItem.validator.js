import { BudgetItemSchema, InsertBudgetItemSchema, UpdateBudgetItemSchema } from "./budgetItem.model.js"

/** @typedef {import("./budgetItem.model.js").BudgetItem} BudgetItem */
/** @typedef {import("./budgetItem.model.js").InsertBudgetItem} InsertBudgetItem */
/** @typedef {import("./budgetItem.model.js").UpdateBudgetItem} UpdateBudgetItem */
/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateBudgetItemSchema = async (data) => {
    const result = await BudgetItemSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertBudgetItemSchema = async (data) => {
    const result = await InsertBudgetItemSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateBudgetItemSchema = async (data) => {
    const result = await UpdateBudgetItemSchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
