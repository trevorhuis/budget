import type { InsertCategory, UpdateCategory } from "./category.model.js";
import {
  deleteCategory,
  getCategoryById,
  getCategoriesByUser,
  getCategoryByUserAndId,
  insertCategory,
  updateCategory,
} from "./category.repository.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";

export const createCategory = async (category: InsertCategory) => {
  await insertCategory(category);
  return true;
};

export const readCategoriesFromUser = async (userId: string) => {
  return await getCategoriesByUser(userId);
};

export const categoryUpdate = async (
  userId: string,
  categoryId: string,
  category: UpdateCategory,
) => {
  const foundCategory = await getCategoryByUserAndId(userId, categoryId);
  if (!foundCategory) {
    const existingCategory = await getCategoryById(categoryId);
    if (existingCategory) {
      throw new AccessDeniedException("Category ownership mismatch");
    }

    throw new NotFoundException("Category not found");
  }

  await updateCategory(userId, categoryId, category);
  return true;
};

export const removeCategory = async (userId: string, categoryId: string) => {
  const foundCategory = await getCategoryByUserAndId(userId, categoryId);
  if (!foundCategory) {
    const existingCategory = await getCategoryById(categoryId);
    if (existingCategory) {
      throw new AccessDeniedException("Category ownership mismatch");
    }

    throw new NotFoundException("Category not found");
  }

  await deleteCategory(userId, categoryId);
  return true;
};
