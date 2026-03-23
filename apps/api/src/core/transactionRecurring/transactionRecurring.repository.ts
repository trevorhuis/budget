import { db } from "../../db/database.js";
import {
  type RecurringTransaction,
  type InsertRecurringTransaction,
  type UpdateRecurringTransaction,
} from "./transactionRecurring.model.js";

export const getRecurringTransactionByUser = async (
  userId: string,
): Promise<RecurringTransaction[]> => {
  return await db
    .selectFrom("recurringTransaction")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
};

export const getRecurringTransactionByUserAndId = async (
  userId: string,
  templateId: string,
): Promise<RecurringTransaction | null> => {
  const template = await db
    .selectFrom("recurringTransaction")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", templateId)
    .executeTakeFirst();

  return template ?? null;
};

export const getRecurringTransactionById = async (
  templateId: string,
): Promise<RecurringTransaction | null> => {
  const template = await db
    .selectFrom("recurringTransaction")
    .selectAll()
    .where("id", "=", templateId)
    .executeTakeFirst();

  return template ?? null;
};

export const insertRecurringTransaction = async (
  templateData: InsertRecurringTransaction,
): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("recurringTransaction")
    .values({
      ...templateData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateRecurringTransaction = async (
  userId: string,
  templateId: string,
  template: UpdateRecurringTransaction,
): Promise<void> => {
  await db
    .updateTable("recurringTransaction")
    .set({
      merchant: template.merchant,
      amount: template.amount,
      notes: template.notes,
      recurringDate: template.recurringDate,
      categoryId: template.categoryId,
      updatedAt: new Date(),
    })
    .where("id", "=", templateId)
    .where("userId", "=", userId)
    .execute();
};

export const deleteRecurringTransaction = async (
  userId: string,
  templateId: string,
): Promise<void> => {
  await db
    .deleteFrom("recurringTransaction")
    .where("id", "=", templateId)
    .where("userId", "=", userId)
    .execute();
};
