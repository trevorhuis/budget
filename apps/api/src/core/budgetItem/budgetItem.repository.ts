import { db } from "../../db/database.js";
import {
  type BudgetItem,
  type InsertBudgetItem,
  type UpdateBudgetItem,
} from "./budgetItem.model.js";

export const getBudgetItemsByUser = async (
  userId: string,
): Promise<BudgetItem[]> => {
  return await db
    .selectFrom("budgetItems")
    .innerJoin("budgets", "budgets.id", "budgetItems.budgetId")
    .selectAll("budgetItems")
    .where("budgets.userId", "=", userId)
    .execute();
};

export const getBudgetItemById = async (
  budgetItemId: string,
): Promise<BudgetItem | null> => {
  const budgetItem = await db
    .selectFrom("budgetItems")
    .selectAll()
    .where("id", "=", budgetItemId)
    .executeTakeFirst();

  return budgetItem ?? null;
};

export const getBudgetItemByUserAndId = async (
  userId: string,
  budgetItemId: string,
): Promise<BudgetItem | null> => {
  const budgetItem = await db
    .selectFrom("budgetItems")
    .innerJoin("budgets", "budgets.id", "budgetItems.budgetId")
    .selectAll("budgetItems")
    .where("budgetItems.id", "=", budgetItemId)
    .where("budgets.userId", "=", userId)
    .executeTakeFirst();

  return budgetItem ?? null;
};

export const insertBudgetItem = async (
  budgetItemData: InsertBudgetItem,
): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("budgetItems")
    .values({
      ...budgetItemData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateBudgetItem = async (
  budgetItemId: string,
  budgetItem: UpdateBudgetItem,
): Promise<void> => {
  await db
    .updateTable("budgetItems")
    .set({
      name: budgetItem.name,
      spentAmount: budgetItem.spentAmount,
      actualAmount: budgetItem.actualAmount,
      updatedAt: new Date(),
    })
    .where("id", "=", budgetItemId)
    .execute();
};

export const deleteBudgetItem = async (budgetItemId: string): Promise<void> => {
  await db.deleteFrom("budgetItems").where("id", "=", budgetItemId).execute();
};
