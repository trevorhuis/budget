import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { type BudgetItem, BudgetItemSchema } from "~/lib/schemas";
import { uuidv7 } from "uuidv7";

import { budgetItemsApi } from "~/lib/api/budgetItems";
import { queryClient } from "~/lib/integrations/queryClient";

type CreateBudgetItemInput = Pick<
  BudgetItem,
  "budgetId" | "categoryId" | "targetAmount"
>;

type UpdateBudgetItemTargetInput = Pick<BudgetItem, "id" | "targetAmount">;

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
      const { data } = await budgetItemsApi.fetch();
      return data.map(normalizeBudgetItem);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await budgetItemsApi.update(
        original.id,
        normalizeBudgetItemUpdate(modified),
      );
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await budgetItemsApi.delete(item.id);
    },
  }),
);

export const createBudgetItem = async ({
  budgetId,
  categoryId,
  targetAmount,
}: CreateBudgetItemInput) => {
  await budgetItemsApi.create({
    id: uuidv7(),
    actualAmount: 0,
    targetAmount,
    budgetId,
    categoryId,
  });

  await budgetItemCollection.utils.refetch();
};

export const updateBudgetItemTarget = async ({
  id,
  targetAmount,
}: UpdateBudgetItemTargetInput) => {
  await Promise.resolve(
    budgetItemCollection.update(id, (draft) => {
      draft.targetAmount = targetAmount;
    }),
  );
};
