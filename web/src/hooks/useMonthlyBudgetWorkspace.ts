import { useLiveQuery } from "@tanstack/react-db";
import type { BudgetItem, Category } from "../lib/schemas";
import {
  budgetCollection,
  budgetItemCollection,
  categoryCollection,
} from "../lib/collections";

type BudgetRow = {
  budgetItem: BudgetItem;
  category: Category;
  group: string;
  isIncome: boolean;
  variance: number;
  status: "funded" | "pending" | "on-track" | "tight" | "overspent";
};

type BudgetGroup = {
  group: string;
  isIncome: boolean;
  rows: BudgetRow[];
};

const groupOrder = (group: string) => {
  if (group === "Income") {
    return 0;
  }

  return 1;
};

const getExpenseStatus = (budgetItem: BudgetItem) => {
  if (budgetItem.actualAmount > budgetItem.targetAmount) {
    return "overspent" as const;
  }

  const ratio =
    budgetItem.targetAmount === 0
      ? 0
      : budgetItem.actualAmount / budgetItem.targetAmount;

  if (ratio >= 0.85) {
    return "tight" as const;
  }

  return "on-track" as const;
};

const getIncomeStatus = (budgetItem: BudgetItem) => {
  if (budgetItem.actualAmount >= budgetItem.targetAmount) {
    return "funded" as const;
  }

  return "pending" as const;
};

export const useMonthlyBudgetWorkspace = (month: number, year: number) => {
  const { data: budgets = [] } = useLiveQuery((q) =>
    q.from({ budgets: budgetCollection }),
  );

  const { data: budgetItems = [] } = useLiveQuery((q) =>
    q.from({ budgetItems: budgetItemCollection }),
  );

  const { data: categories = [] } = useLiveQuery((q) =>
    q.from({ categories: categoryCollection }),
  );

  const budget =
    budgets.find(
      (candidate) => candidate.month === month && candidate.year === year,
    ) ?? null;

  const selectedBudgetItems = budget
    ? budgetItems.filter((budgetItem) => budgetItem.budgetId === budget.id)
    : [];

  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );

  const rows: BudgetRow[] = selectedBudgetItems
    .map((budgetItem) => {
      const category = categoryById.get(budgetItem.categoryId);

      if (!category) {
        return null;
      }

      const isIncome = category.group === "Income";
      const variance = budgetItem.targetAmount - budgetItem.actualAmount;

      return {
        budgetItem,
        category,
        group: category.group,
        isIncome,
        variance,
        status: isIncome
          ? getIncomeStatus(budgetItem)
          : getExpenseStatus(budgetItem),
      };
    })
    .filter((row): row is BudgetRow => row !== null)
    .sort((left, right) => {
      const groupDifference =
        groupOrder(left.group) - groupOrder(right.group) ||
        left.group.localeCompare(right.group);

      if (groupDifference !== 0) {
        return groupDifference;
      }

      return left.category.name.localeCompare(right.category.name);
    });

  const groups = rows.reduce<BudgetGroup[]>((allGroups, row) => {
    const existingGroup = allGroups.find((group) => group.group === row.group);

    if (existingGroup) {
      existingGroup.rows.push(row);
      return allGroups;
    }

    allGroups.push({
      group: row.group,
      isIncome: row.isIncome,
      rows: [row],
    });

    return allGroups;
  }, []);

  const expectedIncome = rows
    .filter((row) => row.isIncome)
    .reduce((sum, row) => sum + row.budgetItem.targetAmount, 0);

  const expectedExpenses = rows
    .filter((row) => !row.isIncome)
    .reduce((sum, row) => sum + row.budgetItem.targetAmount, 0);

  const actualSpending = rows
    .filter((row) => !row.isIncome)
    .reduce((sum, row) => sum + row.budgetItem.actualAmount, 0);

  const plannedNet = expectedIncome - expectedExpenses;

  const overspentCategories = rows
    .filter(
      (row) =>
        !row.isIncome &&
        row.budgetItem.actualAmount > row.budgetItem.targetAmount,
    )
    .sort((left, right) => left.variance - right.variance);

  const activeCategories = categories.filter(
    (category) => category.status === "active",
  );

  const usedCategoryIds = new Set(rows.map((row) => row.category.id));

  const availableCategories = activeCategories
    .filter((category) => !usedCategoryIds.has(category.id))
    .sort((left, right) => {
      const groupDifference =
        groupOrder(left.group) - groupOrder(right.group) ||
        left.group.localeCompare(right.group);

      if (groupDifference !== 0) {
        return groupDifference;
      }

      return left.name.localeCompare(right.name);
    });

  const knownGroups = Array.from(
    new Set(activeCategories.map((category) => category.group)),
  ).sort((left, right) => {
    const groupDifference =
      groupOrder(left) - groupOrder(right) || left.localeCompare(right);

    return groupDifference;
  });

  return {
    budget,
    groups,
    availableCategories,
    knownGroups,
    expectedIncome,
    expectedExpenses,
    actualSpending,
    plannedNet,
    overspentCategories,
  };
};
