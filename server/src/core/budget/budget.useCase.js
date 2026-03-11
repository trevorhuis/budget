/** @typedef {import("./budget.model.js").Budget} Budget */
/** @typedef {import("./budget.model.js").InsertBudget} InsertBudget */
/** @typedef {import("./budget.model.js").UpdateBudget} UpdateBudget */

/**
 * @param {InsertBudget} budget - Budget object to create
 * @returns {boolean} true if successful
 */
export function createBudget(budget) {
    console.log(budget)
    return true
}

/**
 * @param {string} budgetId - Budget id to read
 * @returns {Budget | null} Budget
 */
export function readBudget(budgetId) {
    console.log(budgetId)
    return null
}

/**
 * @param {string} userId - Owner user id
 * @returns {Budget[]} Budgets for user
 */
export function readBudgetsFromUser(userId) {
    console.log(userId)
    return []
}

/**
 * @param {string} userId - Owner user id
 * @param {number} month - Budget month
 * @param {number} year - Budget year
 * @returns {Budget | null} Budget for period
 */
export function readBudgetForUserMonthYear(userId, month, year) {
    console.log({ userId, month, year })
    return null
}

/**
 * @param {UpdateBudget} budget - Updated budget object
 * @returns {boolean} true if successful
 */
export function updateBudget(budget) {
    console.log(budget)
    return true
}

/**
 * @param {string} budgetId - id to delete
 * @returns {boolean} true if successful
 */
export function deleteBudget(budgetId) {
    console.log(budgetId)
    return true
}
