/** @typedef {import("./transactionRecurring.model.js").TransactionRecurring} TransactionRecurring */
/** @typedef {import("./transactionRecurring.model.js").InsertTransactionRecurring} InsertTransactionRecurring */
/** @typedef {import("./transactionRecurring.model.js").UpdateTransactionRecurring} UpdateTransactionRecurring */

/**
 * @param {InsertTransactionRecurring} template - Recurring transaction template to create
 * @returns {boolean} true if successful
 */
export function createTransactionRecurring(template) {
    console.log(template)
    return true
}

/**
 * @param {string} templateId - Recurring template id to read
 * @returns {TransactionRecurring | null} Recurring transaction template
 */
export function readTransactionRecurring(templateId) {
    console.log(templateId)
    return null
}

/**
 * @param {string} userId - Owner user id
 * @returns {TransactionRecurring[]} Recurring templates for user
 */
export function readRecurringFromUser(userId) {
    console.log(userId)
    return []
}

/**
 * @param {string} categoryId - Category id
 * @returns {TransactionRecurring[]} Recurring templates for category
 */
export function readRecurringForCategory(categoryId) {
    console.log(categoryId)
    return []
}

/**
 * @param {UpdateTransactionRecurring} template - Updated recurring template
 * @returns {boolean} true if successful
 */
export function updateTransactionRecurring(template) {
    console.log(template)
    return true
}

/**
 * @param {string} templateId - id to delete
 * @returns {boolean} true if successful
 */
export function deleteTransactionRecurring(templateId) {
    console.log(templateId)
    return true
}
