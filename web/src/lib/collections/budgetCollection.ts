import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { type Budget, BudgetSchema } from "~/lib/schemas";
import { uuidv7 } from "uuidv7";

import { budgetsApi } from "~/lib/api/budgets";
import { queryClient } from "~/lib/integrations/queryClient";

type CreateBudgetInput = Pick<Budget, "month" | "year">;

const normalizeBudget = (budget: Budget) => ({
  ...budget,
  createdAt: budget.createdAt ? new Date(budget.createdAt) : undefined,
  updatedAt: budget.updatedAt ? new Date(budget.updatedAt) : undefined,
});

const normalizeBudgetUpdate = (budget: Budget) => ({
  month: budget.month,
  year: budget.year,
});

export const budgetCollection = createCollection(
  queryCollectionOptions({
    schema: BudgetSchema,
    queryClient,
    queryKey: ["budgets"],
    getKey: (budget) => budget.id,
    queryFn: async () => {
      const { data } = await budgetsApi.fetch();
      return data.map(normalizeBudget);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await budgetsApi.update(original.id, normalizeBudgetUpdate(modified));
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await budgetsApi.delete(item.id);
    },
  }),
);

export const createBudget = async ({ month, year }: CreateBudgetInput) => {
  await budgetsApi.create({
    id: uuidv7(),
    month,
    year,
  });

  await budgetCollection.utils.refetch();
};
