import type { Account, BudgetItem, Category } from "~/lib/schemas";
import {
  formatTransactionBudgetMonth,
  transactionAccountTypeLabels,
} from "~/lib/utils/transactions/format";

export type TransactionAccountOption = {
  id: Account["id"];
  label: string;
  typeLabel: string;
};

export type TransactionBudgetLineOption = {
  id: BudgetItem["id"];
  label: string;
  groupName: string;
};

export const buildTransactionAccountOptions = (
  accounts: readonly Account[],
): TransactionAccountOption[] =>
  [...accounts]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((account) => ({
      id: account.id,
      label: account.name,
      typeLabel: transactionAccountTypeLabels[account.type],
    }));

export const buildTransactionBudgetLineOptions = ({
  budgetItems,
  budgets,
  categories,
}: {
  budgetItems: readonly BudgetItem[];
  budgets: ReadonlyArray<{
    id: string;
    month: number;
    year: number;
  }>;
  categories: readonly Pick<Category, "group" | "id" | "name">[];
}): TransactionBudgetLineOption[] => {
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const budgetById = new Map(
    budgets.map((budget) => [budget.id, budget] as const),
  );

  return [...budgetItems]
    .map((budgetItem) => {
      const category = categoryById.get(budgetItem.categoryId);
      const budget = budgetById.get(budgetItem.budgetId);

      if (!category || !budget) {
        return null;
      }

      return {
        id: budgetItem.id,
        groupName: category.group,
        label: `${category.name} · ${category.group} · ${formatTransactionBudgetMonth(
          budget,
        )}`,
      };
    })
    .filter((option): option is TransactionBudgetLineOption => option !== null)
    .sort((left, right) => left.label.localeCompare(right.label));
};

export const getDefaultTransactionOptionId = <
  TOption extends {
    id: string;
  },
>(
  currentId: string,
  options: readonly TOption[],
) => {
  if (currentId && options.some((option) => option.id === currentId)) {
    return currentId;
  }

  return options[0]?.id ?? "";
};
