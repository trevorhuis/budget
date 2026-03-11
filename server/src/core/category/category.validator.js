import { CategorySchema, InsertCategorySchema, UpdateCategorySchema } from "./category.model.js"

/** @typedef {import("./category.model.js").Category } Category */
/** @typedef {import("./category.model.js").InsertCategory} InsertCategory */
/** @typedef {import("./category.model.js").UpdateCategory} UpdateCategory */
/** @typedef {import("../../utils/validator.utils.js").ValidatorResult} ValidatorResult */

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateCategorySchema = async (data) => {
    const result = await CategorySchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateInsertCategorySchema = async (data) => {
    const result = await InsertCategorySchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}

/**
 * @param {object} data - object to validate
 * @returns {Promise<ValidatorResult>} validation result
 */
export const validateUpdateCategorySchema = async (data) => {
    const result = await UpdateCategorySchema.safeParseAsync(data)
    if (result.success) return { success: result.success, data: result.data }
    return { success: result.success, error: result.error.message }
}
