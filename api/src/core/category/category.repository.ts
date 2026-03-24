import { db } from "../../db/database.js";
import {
  type Category,
  type InsertCategory,
  type UpdateCategory,
} from "./category.model.js";

export const getCategoriesByUser = async (
  userId: string,
): Promise<Category[]> => {
  return await db
    .selectFrom("categories")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
};

export const getCategoryByUserAndId = async (
  userId: string,
  categoryId: string,
): Promise<Category | null> => {
  const category = await db
    .selectFrom("categories")
    .selectAll()
    .where("userId", "=", userId)
    .where("id", "=", categoryId)
    .executeTakeFirst();

  return category ?? null;
};

export const getCategoryById = async (
  categoryId: string,
): Promise<Category | null> => {
  const category = await db
    .selectFrom("categories")
    .selectAll()
    .where("id", "=", categoryId)
    .executeTakeFirst();

  return category ?? null;
};

export const insertCategory = async (
  categoryData: InsertCategory,
): Promise<void> => {
  const now = new Date().toISOString();

  await db
    .insertInto("categories")
    .values({
      ...categoryData,
      createdAt: now,
      updatedAt: now,
    })
    .executeTakeFirstOrThrow();
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  category: UpdateCategory,
): Promise<void> => {
  await db
    .updateTable("categories")
    .set({
      name: category.name,
      group: category.group,
      status: category.status,
      updatedAt: new Date(),
    })
    .where("id", "=", categoryId)
    .where("userId", "=", userId)
    .execute();
};

export const deleteCategory = async (
  userId: string,
  categoryId: string,
): Promise<void> => {
  await db
    .deleteFrom("categories")
    .where("id", "=", categoryId)
    .where("userId", "=", userId)
    .execute();
};
