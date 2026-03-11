/** @typedef {import("./account.model.js").InsertAccount} InsertAccount */
/** @typedef {import("./account.model.js").UpdateAccount} UpdateAccount */
/** @typedef {import("./account.model.js").Account} Account */

import { insertAccount, getAccountsByUser } from './account.repository.js'

/**
 * @param {InsertAccount} account - Account object to create
 * @returns {Promise<boolean>} true if successful
 */
export const createAccount = async (account) => {
    await insertAccount(account)
    return true
}

/**
 * @param {string} accountId - Account id to read
 * @returns {Account | null} Account
 */
export const readAccount = (accountId) => {
    console.log(accountId)
    return null
}

/**
 * @param {string} userId - Owner user id
 * @returns {Account[]} Accounts for user
 */
export const readAccountsFromUser = (userId) => {
    return getAccountsByUser(userId)
}

/**
 * @param {UpdateAccount} account - Updated account object
 * @returns {boolean} true if successful
 */
export const updateAccount = (account) => {
    console.log(account)
    return true
}

/**
 * @param {string} accountId - id to delete
 * @returns {boolean} true if successful
 */
export const deleteAccount = (accountId) => {
    console.log(accountId)
    return true
}
