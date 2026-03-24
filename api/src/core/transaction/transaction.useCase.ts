import type {
  InsertTransaction,
  UpdateTransaction,
} from "./transaction.model.js";
import { getAccountByUserAndId } from "../account/account.repository.js";
import { getBudgetItemByUserAndId } from "../budgetItem/budgetItem.repository.js";
import { getRecurringTransactionByUserAndId } from "../transactionRecurring/transactionRecurring.repository.js";
import {
  deleteTransaction,
  getTransactionById,
  getTransactionByUserAndId,
  getTransactionsByUser,
  insertTransaction,
  updateTransaction,
} from "./transaction.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createTransaction = async (transaction: InsertTransaction) => {
  const [account, budgetItem, template] = await Promise.all([
    getAccountByUserAndId(transaction.userId, transaction.accountId),
    getBudgetItemByUserAndId(transaction.userId, transaction.budgetItemId),
    transaction.recurringTemplateId
      ? getRecurringTransactionByUserAndId(
          transaction.userId,
          transaction.recurringTemplateId,
        )
      : Promise.resolve(null),
  ]);

  if (!account || !budgetItem) {
    throw new NotFoundException("Referenced resource not found");
  }

  if (transaction.recurringTemplateId && !template) {
    throw new NotFoundException("Referenced resource not found");
  }

  await insertTransaction(transaction);
  return true;
};

export const readTransactionsFromUser = async (userId: string) => {
  return await getTransactionsByUser(userId);
};

export const transactionUpdate = async (
  userId: string,
  transactionId: string,
  transaction: UpdateTransaction,
) => {
  const foundTransaction = await getTransactionByUserAndId(
    userId,
    transactionId,
  );
  if (!foundTransaction) {
    const existingTransaction = await getTransactionById(transactionId);
    if (existingTransaction) {
      throw new AccessDeniedException("Transaction ownership mismatch");
    }

    throw new NotFoundException("Transaction not found");
  }

  if (transaction.accountId) {
    const account = await getAccountByUserAndId(userId, transaction.accountId);
    if (!account) {
      throw new AccessDeniedException("Account ownership mismatch");
    }
  }

  if (transaction.budgetItemId) {
    const budgetItem = await getBudgetItemByUserAndId(
      userId,
      transaction.budgetItemId,
    );
    if (!budgetItem) {
      throw new AccessDeniedException("Budget item ownership mismatch");
    }
  }

  if (transaction.recurringTemplateId) {
    const template = await getRecurringTransactionByUserAndId(
      userId,
      transaction.recurringTemplateId,
    );
    if (!template) {
      throw new AccessDeniedException("Recurring template ownership mismatch");
    }
  }

  await updateTransaction(userId, transactionId, transaction);
  return true;
};

export const removeTransaction = async (
  userId: string,
  transactionId: string,
) => {
  const foundTransaction = await getTransactionByUserAndId(
    userId,
    transactionId,
  );
  if (!foundTransaction) {
    const existingTransaction = await getTransactionById(transactionId);
    if (existingTransaction) {
      throw new AccessDeniedException("Transaction ownership mismatch");
    }

    throw new NotFoundException("Transaction not found");
  }

  await deleteTransaction(userId, transactionId);
  return true;
};
