import type { InsertBudgetItem, UpdateBudgetItem } from "./budgetItem.model.js";
import {
  getBudgetByUserAndId,
} from "../budget/budget.repository.js";
import {
  getCategoryByUserAndId,
} from "../category/category.repository.js";
import {
  deleteBudgetItem,
  getBudgetItemById,
  getBudgetItemsByUser,
  insertBudgetItem,
  updateBudgetItem,
} from "./budgetItem.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createBudgetItem = async (budgetItem: InsertBudgetItem, userId: string) => {
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
  const foundItem = await getBudgetItemById(budgetItemId);
  if (!foundItem) {
    throw new NotFoundException("Budget item not found");
  }

  const budget = await getBudgetByUserAndId(userId, foundItem.budgetId);
  if (!budget) {
    throw new AccessDeniedException("Budget ownership mismatch");
  }

  await updateBudgetItem(budgetItemId, budgetItem);
  return true;
};

export const removeBudgetItem = async (userId: string, budgetItemId: string) => {
  const foundItem = await getBudgetItemById(budgetItemId);
  if (!foundItem) {
    throw new NotFoundException("Budget item not found");
  }

  const budget = await getBudgetByUserAndId(userId, foundItem.budgetId);
  if (!budget) {
    throw new AccessDeniedException("Budget ownership mismatch");
  }

  await deleteBudgetItem(budgetItemId);
  return true;
};
