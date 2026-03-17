import { db } from "../../db/database.js";
import {
  type TransactionRecurring,
  type InsertTransactionRecurring,
  type UpdateTransactionRecurring,
} from "./transactionRecurring.model.js";

export const getTransactionRecurringByUser = async (
  userId: string,
): Promise<TransactionRecurring[]> => {
  return await db
    .selectFrom("transactionRecurring")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
};

export const getTransactionRecurringByUserAndId = async (
  userId: string,
  templateId: string,
): Promise<TransactionRecurring | null> => {
  const template = await db
    .selectFrom("transactionRecurring")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", templateId)
    .executeTakeFirst();

  return template ?? null;
};

export const getTransactionRecurringById = async (
  templateId: string,
): Promise<TransactionRecurring | null> => {
  const template = await db
    .selectFrom("transactionRecurring")
    .selectAll()
    .where("id", "=", templateId)
    .executeTakeFirst();

  return template ?? null;
};

export const insertTransactionRecurring = async (
  templateData: InsertTransactionRecurring,
): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("transactionRecurring")
    .values({
      ...templateData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateTransactionRecurring = async (
  templateId: string,
  template: UpdateTransactionRecurring,
): Promise<void> => {
  await db
    .updateTable("transactionRecurring")
    .set({
      merchant: template.merchant,
      amount: template.amount,
      notes: template.notes,
      updatedAt: new Date(),
    })
    .where("id", "=", templateId)
    .execute();
};

export const deleteTransactionRecurring = async (templateId: string): Promise<void> => {
  await db
    .deleteFrom("transactionRecurring")
    .where("id", "=", templateId)
    .execute();
};
