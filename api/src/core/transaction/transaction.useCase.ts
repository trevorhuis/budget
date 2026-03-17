import type { InsertTransaction, UpdateTransaction } from "./transaction.model.js";
import {
  getAccountByUserAndId,
} from "../account/account.repository.js";
import { getBudgetByUserAndId } from "../budget/budget.repository.js";
import { getCategoryByUserAndId } from "../category/category.repository.js";
import { getTransactionRecurringByUserAndId } from "../transactionRecurring/transactionRecurring.repository.js";
import {
  deleteTransaction,
  getTransactionById,
  getTransactionsByUser,
  insertTransaction,
  updateTransaction,
} from "./transaction.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createTransaction = async (
  transaction: InsertTransaction,
) => {
  const [account, budget, category, template] = await Promise.all([
    getAccountByUserAndId(transaction.userId, transaction.accountId),
    getBudgetByUserAndId(transaction.userId, transaction.budgetId),
    getCategoryByUserAndId(transaction.userId, transaction.categoryId),
    transaction.recurringTemplateId
      ? getTransactionRecurringByUserAndId(
          transaction.userId,
          transaction.recurringTemplateId,
        )
      : Promise.resolve(null),
  ]);

  if (!account || !budget || !category) {
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
  const foundTransaction = await getTransactionById(transactionId);
  if (!foundTransaction) {
    throw new NotFoundException("Transaction not found");
  }
  if (foundTransaction.userId !== userId) {
    throw new AccessDeniedException("Transaction ownership mismatch");
  }

  await updateTransaction(transactionId, transaction);
  return true;
};

export const removeTransaction = async (userId: string, transactionId: string) => {
  const foundTransaction = await getTransactionById(transactionId);
  if (!foundTransaction) {
    throw new NotFoundException("Transaction not found");
  }
  if (foundTransaction.userId !== userId) {
    throw new AccessDeniedException("Transaction ownership mismatch");
  }

  await deleteTransaction(transactionId);
  return true;
};
