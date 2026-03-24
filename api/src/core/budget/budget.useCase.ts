import type { InsertBudget, UpdateBudget } from "./budget.model.js";
import {
  deleteBudget,
  getBudgetById,
  getBudgetByUserAndId,
  getBudgetsByUser,
  insertBudget,
  updateBudget,
} from "./budget.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createBudget = async (budget: InsertBudget) => {
  await insertBudget(budget);
  return true;
};

export const readBudgetsFromUser = async (userId: string) => {
  return await getBudgetsByUser(userId);
};

export const budgetUpdate = async (
  userId: string,
  budgetId: string,
  budget: UpdateBudget,
) => {
  const foundBudget = await getBudgetByUserAndId(userId, budgetId);
  if (!foundBudget) {
    const existingBudget = await getBudgetById(budgetId);
    if (existingBudget) {
      throw new AccessDeniedException("Budget ownership mismatch");
    }

    throw new NotFoundException("Budget not found");
  }

  await updateBudget(userId, budgetId, budget);
  return true;
};

export const removeBudget = async (userId: string, budgetId: string) => {
  const foundBudget = await getBudgetByUserAndId(userId, budgetId);
  if (!foundBudget) {
    const existingBudget = await getBudgetById(budgetId);
    if (existingBudget) {
      throw new AccessDeniedException("Budget ownership mismatch");
    }

    throw new NotFoundException("Budget not found");
  }

  await deleteBudget(userId, budgetId);
  return true;
};
