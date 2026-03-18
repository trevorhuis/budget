import type { InsertBudget, UpdateBudget } from "./budget.model.js";
import {
  deleteBudget,
  getBudgetById,
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
  const foundBudget = await getBudgetById(budgetId);
  if (!foundBudget) {
    throw new NotFoundException("Budget not found");
  }
  if (foundBudget.userId !== userId) {
    throw new AccessDeniedException("Budget ownership mismatch");
  }

  await updateBudget(budgetId, budget);
  return true;
};

export const removeBudget = async (userId: string, budgetId: string) => {
  const foundBudget = await getBudgetById(budgetId);
  if (!foundBudget) {
    throw new NotFoundException("Budget not found");
  }
  if (foundBudget.userId !== userId) {
    throw new AccessDeniedException("Budget ownership mismatch");
  }

  await deleteBudget(budgetId);
  return true;
};
