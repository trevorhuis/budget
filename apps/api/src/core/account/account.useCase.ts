import type { InsertAccount, UpdateAccount } from "./account.model.js";
import {
  deleteAccount,
  getAccountById,
  getAccountByUserAndId,
  getAccountsByUser,
  insertAccount,
  updateAccount,
} from "./account.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createAccount = async (account: InsertAccount) => {
  await insertAccount(account);
  return true;
};

export const readAccountsFromUser = async (userId: string) => {
  return await getAccountsByUser(userId);
};

export const accountUpdate = async (
  userId: string,
  accountId: string,
  account: UpdateAccount,
) => {
  const foundAccount = await getAccountByUserAndId(userId, accountId);
  if (!foundAccount) {
    const existingAccount = await getAccountById(accountId);
    if (existingAccount) {
      throw new AccessDeniedException("Account ownership mismatch");
    }

    throw new NotFoundException("Account not found");
  }

  await updateAccount(userId, accountId, account);
  return true;
};

export const removeAccount = async (userId: string, accountId: string) => {
  const account = await getAccountByUserAndId(userId, accountId);
  if (!account) {
    const existingAccount = await getAccountById(accountId);
    if (existingAccount) {
      throw new AccessDeniedException("Account ownership mismatch");
    }

    throw new NotFoundException("Account not found");
  }

  await deleteAccount(userId, accountId);
  return true;
};
