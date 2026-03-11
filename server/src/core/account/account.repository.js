import sql from "../../db/index.js";

/** @typedef {import("./account.model.js").InsertAccount} InsertAccount */

/**
 * @param {string} userId - userId to search accounts for
 */
export const getAccountsByUser = async (userId) => {
    const accounts = await sql`
        select
            id,
            name,
            type,
            balance,
            "userId",
            "createdAt",
            "updatedAt"
        from accounts
        where "userId" = ${userId}
    `
    return accounts
}

/**
 * @param {InsertAccount} accountData - account data to insert
 */
export const insertAccount = async (accountData) => {
    const now = new Date()
    const isoNow = now.toISOString()

    await sql`
        insert into accounts
            (id, name, type, balance, "userId", "createdAt", "updatedAt")
        values (
            ${accountData.id},
            ${accountData.name},
            ${accountData.type},
            ${accountData.balance},
            ${accountData.userId},
            ${isoNow},
            ${isoNow}
        )
    `
}
