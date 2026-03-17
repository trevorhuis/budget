import type { InsertCategory, UpdateCategory } from "./category.model.js";
import {
  getCategoriesByUser,
  getCategoryById,
  insertCategory,
  updateCategory,
  deleteCategory,
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
  const foundCategory = await getCategoryById(categoryId);
  if (!foundCategory) {
    throw new NotFoundException("Category not found");
  }
  if (foundCategory.userId !== userId) {
    throw new AccessDeniedException("Category ownership mismatch");
  }

  await updateCategory(categoryId, category);
  return true;
};

export const removeCategory = async (userId: string, categoryId: string) => {
  const foundCategory = await getCategoryById(categoryId);
  if (!foundCategory) {
    throw new NotFoundException("Category not found");
  }
  if (foundCategory.userId !== userId) {
    throw new AccessDeniedException("Category ownership mismatch");
  }

  await deleteCategory(categoryId);
  return true;
};
