import type {
  InsertRecurringTransaction,
  UpdateRecurringTransaction,
} from "./transactionRecurring.model.js";
import { getCategoryByUserAndId } from "../category/category.repository.js";
import {
  deleteRecurringTransaction,
  getRecurringTransactionById,
  getRecurringTransactionByUserAndId,
  getRecurringTransactionByUser,
  insertRecurringTransaction,
  updateRecurringTransaction,
} from "./transactionRecurring.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createRecurringTransaction = async (
  template: InsertRecurringTransaction,
) => {
  const category = await getCategoryByUserAndId(
    template.userId,
    template.categoryId,
  );
  if (!category) {
    throw new NotFoundException("Category not found");
  }

  await insertRecurringTransaction(template);
  return true;
};

export const readRecurringFromUser = async (userId: string) => {
  return await getRecurringTransactionByUser(userId);
};

export const recurringTransactionUpdate = async (
  userId: string,
  templateId: string,
  template: UpdateRecurringTransaction,
) => {
  const foundTemplate = await getRecurringTransactionByUserAndId(
    userId,
    templateId,
  );
  if (!foundTemplate) {
    const existingTemplate = await getRecurringTransactionById(templateId);
    if (existingTemplate) {
      throw new AccessDeniedException("Recurring template ownership mismatch");
    }

    throw new NotFoundException("Recurring template not found");
  }

  if (template.categoryId) {
    const category = await getCategoryByUserAndId(userId, template.categoryId);
    if (!category) {
      throw new AccessDeniedException("Category ownership mismatch");
    }
  }

  await updateRecurringTransaction(userId, templateId, template);
  return true;
};

export const removeRecurringTransaction = async (
  userId: string,
  templateId: string,
) => {
  const foundTemplate = await getRecurringTransactionByUserAndId(
    userId,
    templateId,
  );
  if (!foundTemplate) {
    const existingTemplate = await getRecurringTransactionById(templateId);
    if (existingTemplate) {
      throw new AccessDeniedException("Recurring template ownership mismatch");
    }

    throw new NotFoundException("Recurring template not found");
  }

  await deleteRecurringTransaction(userId, templateId);
  return true;
};
