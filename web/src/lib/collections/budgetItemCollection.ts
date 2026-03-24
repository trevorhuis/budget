import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { type BudgetItem, BudgetItemSchema } from "../schemas";
import { uuidv7 } from "uuidv7";

import { API } from "../api";
import { queryClient } from "../integrations/queryClient";

type CreateBudgetItemInput = Pick<
  BudgetItem,
  "budgetId" | "categoryId" | "targetAmount"
>;

const normalizeBudgetItem = (budgetItem: BudgetItem) => ({
  ...budgetItem,
  createdAt: budgetItem.createdAt ? new Date(budgetItem.createdAt) : undefined,
  updatedAt: budgetItem.updatedAt ? new Date(budgetItem.updatedAt) : undefined,
});

const normalizeBudgetItemUpdate = (budgetItem: BudgetItem) => ({
  actualAmount: budgetItem.actualAmount,
  targetAmount: budgetItem.targetAmount,
});

export const budgetItemCollection = createCollection(
  queryCollectionOptions({
    schema: BudgetItemSchema,
    queryClient,
    queryKey: ["budgetItems"],
    getKey: (budgetItem) => budgetItem.id,
    queryFn: async () => {
      const { data } = await API.budgetItems.fetch();
      return data.map(normalizeBudgetItem);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await API.budgetItems.update(
        original.id,
        normalizeBudgetItemUpdate(modified),
      );
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await API.budgetItems.delete(item.id);
    },
  }),
);

export const createBudgetItem = async ({
  budgetId,
  categoryId,
  targetAmount,
}: CreateBudgetItemInput) => {
  await API.budgetItems.create({
    id: uuidv7(),
    actualAmount: 0,
    targetAmount,
    budgetId,
    categoryId,
  });

  await budgetItemCollection.utils.refetch();
};
