import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { CategorySchema, type Category } from "~/lib/schemas";
import { uuidv7 } from "uuidv7";

import { categoriesApi } from "~/lib/api/categories";
import { queryClient } from "~/lib/integrations/queryClient";

type CreateCategoryInput = Pick<Category, "name" | "group">;

const normalizeCategory = (category: Category) => ({
  ...category,
  createdAt: category.createdAt ? new Date(category.createdAt) : undefined,
  updatedAt: category.updatedAt ? new Date(category.updatedAt) : undefined,
});

const normalizeCategoryUpdate = (category: Category) => ({
  name: category.name,
  group: category.group,
  status: category.status,
});

export const categoryCollection = createCollection(
  queryCollectionOptions({
    schema: CategorySchema,
    queryClient,
    queryKey: ["categories"],
    getKey: (category) => category.id,
    queryFn: async () => {
      const { data } = await categoriesApi.fetch();
      return data.map(normalizeCategory);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await categoriesApi.update(
        original.id,
        normalizeCategoryUpdate(modified),
      );
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await categoriesApi.delete(item.id);
    },
  }),
);

export const createCategory = async ({ name, group }: CreateCategoryInput) => {
  const id = uuidv7();

  await categoriesApi.create({
    id,
    name,
    group,
    status: "active",
  });

  await categoryCollection.utils.refetch();

  return id;
};
