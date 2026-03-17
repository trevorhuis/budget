import { db } from "../../db/database.js";
import {
  type Transaction,
  type InsertTransaction,
  type UpdateTransaction,
} from "./transaction.model.js";

export const getTransactionsByUser = async (
  userId: string,
): Promise<Transaction[]> => {
  return await db
    .selectFrom("transactions")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
};

export const getTransactionByUserAndId = async (
  userId: string,
  transactionId: string,
): Promise<Transaction | null> => {
  const transaction = await db
    .selectFrom("transactions")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", transactionId)
    .executeTakeFirst();

  return transaction ?? null;
};

export const getTransactionById = async (
  transactionId: string,
): Promise<Transaction | null> => {
  const transaction = await db
    .selectFrom("transactions")
    .selectAll()
    .where("id", "=", transactionId)
    .executeTakeFirst();

  return transaction ?? null;
};

export const insertTransaction = async (
  transactionData: InsertTransaction,
): Promise<void> => {
  const now = new Date().toISOString();
  const date = transactionData.date.toISOString();

  await db
    .insertInto("transactions")
    .values({
      ...transactionData,
      date,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateTransaction = async (
  transactionId: string,
  transaction: UpdateTransaction,
): Promise<void> => {
  await db
    .updateTable("transactions")
    .set({
      merchant: transaction.merchant,
      amount: transaction.amount,
      notes: transaction.notes,
      date: transaction.date.toISOString(),
      updatedAt: new Date(),
    })
    .where("id", "=", transactionId)
    .execute();
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  await db
    .deleteFrom("transactions")
    .where("id", "=", transactionId)
    .execute();
};
