import type {
  InsertTransactionRecurring,
  UpdateTransactionRecurring,
} from "./transactionRecurring.model.js";
import { getCategoryByUserAndId } from "../category/category.repository.js";
import {
  deleteTransactionRecurring,
  getTransactionRecurringById,
  getTransactionRecurringByUser,
  insertTransactionRecurring,
  updateTransactionRecurring,
} from "./transactionRecurring.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createTransactionRecurring = async (
  template: InsertTransactionRecurring,
) => {
  const category = await getCategoryByUserAndId(
    template.userId,
    template.categoryId,
  );
  if (!category) {
    throw new NotFoundException("Category not found");
  }

  await insertTransactionRecurring(template);
  return true;
};

export const readRecurringFromUser = async (userId: string) => {
  return await getTransactionRecurringByUser(userId);
};

export const transactionRecurringUpdate = async (
  userId: string,
  templateId: string,
  template: UpdateTransactionRecurring,
) => {
  const foundTemplate = await getTransactionRecurringById(templateId);
  if (!foundTemplate) {
    throw new NotFoundException("Recurring template not found");
  }

  if (foundTemplate.userId !== userId) {
    throw new AccessDeniedException("Recurring template ownership mismatch");
  }

  await updateTransactionRecurring(templateId, template);
  return true;
};

export const removeTransactionRecurring = async (
  userId: string,
  templateId: string,
) => {
  const foundTemplate = await getTransactionRecurringById(templateId);
  if (!foundTemplate) {
    throw new NotFoundException("Recurring template not found");
  }

  if (foundTemplate.userId !== userId) {
    throw new AccessDeniedException("Recurring template ownership mismatch");
  }

  await deleteTransactionRecurring(templateId);
  return true;
};
