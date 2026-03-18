import type { InsertAccount, UpdateAccount } from "./account.model.js";
import {
  insertAccount,
  getAccountsByUser,
  deleteAccount,
  updateAccount,
  getAccountById,
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
  const foundAccount = await getAccountById(accountId);
  if (!foundAccount) {
    throw new NotFoundException("Account not found");
  }
  if (foundAccount.userId !== userId) {
    throw new AccessDeniedException();
  }

  await updateAccount(accountId, account);
  return true;
};

export const removeAccount = async (userId: string, accountId: string) => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new NotFoundException("Account not found");
  }
  if (account.userId !== userId) {
    throw new AccessDeniedException();
  }

  await deleteAccount(accountId);
  return true;
};
