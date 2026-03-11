/** @typedef {import("./transaction.model.js").Transaction} Transaction */
/** @typedef {import("./transaction.model.js").InsertTransaction} InsertTransaction */
/** @typedef {import("./transaction.model.js").UpdateTransaction} UpdateTransaction */

/**
 * @param {InsertTransaction} transaction - Transaction object to create
 * @returns {boolean} true if successful
 */
export function createTransaction(transaction) {
    console.log(transaction)
    return true
}

/**
 * @param {string} transactionId - Transaction id to read
 * @returns {Transaction | null} Transaction
 */
export function readTransaction(transactionId) {
    console.log(transactionId)
    return null
}

/**
 * @param {string} userId - Owner user id
 * @returns {Transaction[]} Transactions for user
 */
export function readTransactionsFromUser(userId) {
    console.log(userId)
    return []
}

/**
 * @param {string} accountId - Account id
 * @returns {Transaction[]} Transactions for account
 */
export function readTransactionsForAccount(accountId) {
    console.log(accountId)
    return []
}

/**
 * @param {string} budgetId - Budget id
 * @returns {Transaction[]} Transactions for budget
 */
export function readTransactionsForBudget(budgetId) {
    console.log(budgetId)
    return []
}

/**
 * @param {UpdateTransaction} transaction - Updated transaction object
 * @returns {boolean} true if successful
 */
export function updateTransaction(transaction) {
    console.log(transaction)
    return true
}

/**
 * @param {string} transactionId - id to delete
 * @returns {boolean} true if successful
 */
export function deleteTransaction(transactionId) {
    console.log(transactionId)
    return true
}
