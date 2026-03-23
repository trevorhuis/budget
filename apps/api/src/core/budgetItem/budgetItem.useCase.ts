import type { InsertBudgetItem, UpdateBudgetItem } from "./budgetItem.model.js";
import { getBudgetByUserAndId } from "../budget/budget.repository.js";
import { getCategoryByUserAndId } from "../category/category.repository.js";
import {
  deleteBudgetItem,
  getBudgetItemsByUser,
  getBudgetItemById,
  getBudgetItemByUserAndId,
  insertBudgetItem,
  updateBudgetItem,
} from "./budgetItem.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createBudgetItem = async (
  budgetItem: InsertBudgetItem,
  userId: string,
) => {
  const [budget, category] = await Promise.all([
    getBudgetByUserAndId(userId, budgetItem.budgetId),
    getCategoryByUserAndId(userId, budgetItem.categoryId),
  ]);

  if (!budget || !category) {
    throw new NotFoundException("Budget item reference not found");
  }

  await insertBudgetItem(budgetItem);
  return true;
};

export const readBudgetItemsFromUser = async (userId: string) => {
  return await getBudgetItemsByUser(userId);
};

export const budgetItemUpdate = async (
  userId: string,
  budgetItemId: string,
  budgetItem: UpdateBudgetItem,
) => {
  const foundItem = await getBudgetItemByUserAndId(userId, budgetItemId);
  if (!foundItem) {
    const existingItem = await getBudgetItemById(budgetItemId);
    if (existingItem) {
      throw new AccessDeniedException("Budget item ownership mismatch");
    }

    throw new NotFoundException("Budget item not found");
  }

  await updateBudgetItem(userId, budgetItemId, budgetItem);
  return true;
};

export const removeBudgetItem = async (
  userId: string,
  budgetItemId: string,
) => {
  const foundItem = await getBudgetItemByUserAndId(userId, budgetItemId);
  if (!foundItem) {
    const existingItem = await getBudgetItemById(budgetItemId);
    if (existingItem) {
      throw new AccessDeniedException("Budget item ownership mismatch");
    }

    throw new NotFoundException("Budget item not found");
  }

  await deleteBudgetItem(userId, budgetItemId);
  return true;
};
