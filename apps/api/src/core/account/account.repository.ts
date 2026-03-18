import { db } from "../../db/database.js";
import {
  type InsertAccount,
  type Account,
  type UpdateAccount,
} from "./account.model.js";

export const getAccountsByUser = async (userId: string): Promise<Account[]> => {
  const accounts = await db
    .selectFrom("accounts")
    .selectAll()
    .where("userId", "=", userId)
    .execute();

  return accounts;
};

export const getAccountByUserAndAccountId = async (
  userId: string,
  accountId: string,
): Promise<Account | null> => {
  const account = await db
    .selectFrom("accounts")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", accountId)
    .executeTakeFirst();

  return account ?? null;
};

export const getAccountByUserAndId = getAccountByUserAndAccountId;

export const getAccountById = async (
  accountId: string,
): Promise<Account | null> => {
  const account = await db
    .selectFrom("accounts")
    .selectAll()
    .where("id", "=", accountId)
    .executeTakeFirst();

  return account ?? null;
};

export const insertAccount = async (
  accountData: InsertAccount,
): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("accounts")
    .values({
      ...accountData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const deleteAccount = async (accountId: string): Promise<void> => {
  await db.deleteFrom("accounts").where("id", "=", accountId).execute();
};

export const updateAccount = async (
  accountId: string,
  account: UpdateAccount,
) => {
  const now = new Date();

  await db
    .updateTable("accounts")
    .set({
      name: account.name,
      balance: account.balance,
      type: account.type,
      updatedAt: now,
    })
    .where("id", "=", accountId)
    .execute();
};
