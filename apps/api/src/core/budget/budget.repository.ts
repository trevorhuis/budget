import { db } from "../../db/database.js";
import {
  type Budget,
  type InsertBudget,
  type UpdateBudget,
} from "./budget.model.js";

export const getBudgetsByUser = async (userId: string): Promise<Budget[]> => {
  return await db
    .selectFrom("budgets")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
};

export const getBudgetByUserAndId = async (
  userId: string,
  budgetId: string,
): Promise<Budget | null> => {
  const budget = await db
    .selectFrom("budgets")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", budgetId)
    .executeTakeFirst();

  return budget ?? null;
};

export const getBudgetById = async (
  budgetId: string,
): Promise<Budget | null> => {
  const budget = await db
    .selectFrom("budgets")
    .selectAll()
    .where("id", "=", budgetId)
    .executeTakeFirst();

  return budget ?? null;
};

export const insertBudget = async (budgetData: InsertBudget): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("budgets")
    .values({
      ...budgetData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateBudget = async (
  budgetId: string,
  budget: UpdateBudget,
): Promise<void> => {
  await db
    .updateTable("budgets")
    .set({
      month: budget.month,
      year: budget.year,
      updatedAt: new Date(),
    })
    .where("id", "=", budgetId)
    .execute();
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  await db.deleteFrom("budgets").where("id", "=", budgetId).execute();
};
