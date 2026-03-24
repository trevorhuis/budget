import { and, eq, useLiveQuery } from "@tanstack/react-db";
import {
  budgetCollection,
  budgetItemCollection,
  categoryCollection,
  transactionCollection,
} from "../lib/collections";

export const useBudgetData = (month: number, year: number) => {
  const { data: budget } = useLiveQuery((q) =>
    q
      .from({ budgets: budgetCollection })
      .where(({ budgets }) =>
        and(eq(budgets.month, month), eq(budgets.year, year)),
      )
      .findOne(),
  );

  const { data: categories = [] } = useLiveQuery((q) =>
    q.from({ categories: categoryCollection }).select(({ categories }) => ({
      id: categories.id,
      name: categories.name,
      group: categories.group,
      status: categories.status,
    })),
  );

  const { data: budgetItems = [] } = useLiveQuery(
    (q) => {
      if (!budget) return undefined;

      return q
        .from({ budgetItems: budgetItemCollection })
        .where(({ budgetItems }) => eq(budgetItems.budgetId, budget.id));
    },
    [budget],
  );

  const budgetItemIds = new Set(budgetItems.map((budgetItem) => budgetItem.id));

  const { data: allTransactions = [] } = useLiveQuery((q) =>
    q.from({ transactions: transactionCollection }),
  );

  const transactions = budget
    ? allTransactions.filter((transaction) =>
        budgetItemIds.has(transaction.budgetItemId),
      )
    : [];

  const groupSet = new Set<string>();
  categories.forEach((category) => groupSet.add(category.group));
  const groups = [...groupSet];

  return { budget, budgetItems, categories, transactions, groups };
};
