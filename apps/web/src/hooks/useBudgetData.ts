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
      ).findOne(),
  );

  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoryCollection })
      .select(({ categories }) => ({
        id: categories.id,
        name: categories.name,
        group: categories.group,
        type: categories.type,
      })),
  );

  const { data: transactions } = useLiveQuery(
    (q) => {
      if (!budget) return undefined;

      return q
        .from({ transactions: transactionCollection })
        .where(({ transactions }) => eq(transactions.budgetId, budget.id));
    },
    [budget],
  );

  const { data: budgetItems } = useLiveQuery(
    (q) => {
        if (!budget) return undefined

        return q.from({budgetItems: budgetItemCollection})
        .where(({ budgetItems}) => eq(budgetItems.id, budget.id))
    }
  )

  const groupSet = new Set()
  categories.forEach(category => groupSet.add(category.group))
  const groups = [...groupSet]

  return { budget, budgetItems, categories, transactions, groups };
};
