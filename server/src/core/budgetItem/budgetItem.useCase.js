/** @typedef {import("./budgetItem.model.js").BudgetItem} BudgetItem */
/** @typedef {import("./budgetItem.model.js").InsertBudgetItem} InsertBudgetItem */
/** @typedef {import("./budgetItem.model.js").UpdateBudgetItem} UpdateBudgetItem */

/**
 * @param {InsertBudgetItem} item - Budget item object to create
 * @returns {boolean} true if successful
 */
export function createBudgetItem(item) {
    console.log(item)
    return true
}

/**
 * @param {string} itemId - Budget item id to read
 * @returns {BudgetItem | null} Budget item
 */
export function readBudgetItem(itemId) {
    console.log(itemId)
    return null
}

/**
 * @param {string} budgetId - Parent budget id
 * @returns {BudgetItem[]} Budget items for a budget
 */
export function readBudgetItemsFromBudget(budgetId) {
    console.log(budgetId)
    return []
}

/**
 * @param {string} categoryId - Category id
 * @returns {BudgetItem[]} Budget items for a category
 */
export function readBudgetItemsFromCategory(categoryId) {
    console.log(categoryId)
    return []
}

/**
 * @param {UpdateBudgetItem} item - Updated budget item object
 * @returns {boolean} true if successful
 */
export function updateBudgetItem(item) {
    console.log(item)
    return true
}

/**
 * @param {string} itemId - id to delete
 * @returns {boolean} true if successful
 */
export function deleteBudgetItem(itemId) {
    console.log(itemId)
    return true
}
