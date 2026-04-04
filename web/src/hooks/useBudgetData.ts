import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { budgetCollection } from "~/lib/collections/budgetCollection";
import { budgetItemCollection } from "~/lib/collections/budgetItemCollection";
import { categoryCollection } from "~/lib/collections/categoryCollection";

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
    q.from({ categories: categoryCollection }),
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

  return { budget: budget ?? null, budgetItems, categories };
};
