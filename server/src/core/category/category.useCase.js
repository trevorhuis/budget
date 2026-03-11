/** @typedef {import("./category.model.js").Category } Category */
/** @typedef {import("./category.model.js").InsertCategory} InsertCategory */
/** @typedef {import("./category.model.js").UpdateCategory} UpdateCategory */

/**
 * @param {InsertCategory} category - Category object to create
 * @returns {boolean} true if successful
 */
export function createCategory(category) {
    console.log(category)
    return true
}

/**
 * @param {string} categoryId - Category id to read
 * @returns {Category | null} Category
 */
export function readCategory(categoryId) {
    console.log(categoryId)
    return null
}

/**
 * @param {string} userId - Owner user id
 * @returns {Category[]} Categories for user
 */
export function readCategoriesFromUser(userId) {
    console.log(userId)
    return []
}

/**
 * @param {string} userId - Owner user id
 * @param {"income" | "expense"} type - Category type
 * @returns {Category[]} Categories by type for user
 */
export function readCategoriesFromUserByType(userId, type) {
    console.log({ userId, type })
    return []
}

/**
 * @param {UpdateCategory} category - Updated category object
 * @returns {boolean} true if successful
 */
export function updateCategory(category) {
    console.log(category)
    return true
}

/**
 * @param {string} categoryId - id to delete
 * @returns {boolean} true if successful
 */
export function deleteCategory(categoryId) {
    console.log(categoryId)
    return true
}
