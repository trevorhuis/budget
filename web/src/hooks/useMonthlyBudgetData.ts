import { useBudgetData } from "~/hooks/useBudgetData";
import {
  getExpenseStatus,
  getIncomeStatus,
  sortBudgetGroups,
  sortCategoriesByGroup,
  type BudgetGroup,
  type BudgetRow,
  type MonthlyBudgetPageData,
} from "~/lib/utils/budgetUtils";

export const useMonthlyBudgetData = (
  month: number,
  year: number,
): MonthlyBudgetPageData => {
  const { budget, budgetItems, categories } = useBudgetData(month, year);

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
        sortBudgetGroups(left.group, right.group) ||
        left.category.name.localeCompare(right.category.name);

      return groupDifference;
    });

  const groups = rows.reduce<BudgetGroup[]>((allGroups, row) => {
    const existingGroup = allGroups.find((group) => group.group === row.group);

    if (existingGroup) {
      existingGroup.rows.push(row);
      existingGroup.targetAmount += row.budgetItem.targetAmount;
      existingGroup.actualAmount += row.budgetItem.actualAmount;
      return allGroups;
    }

    allGroups.push({
      actualAmount: row.budgetItem.actualAmount,
      group: row.group,
      isIncome: row.isIncome,
      rows: [row],
      targetAmount: row.budgetItem.targetAmount,
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
    .sort(sortCategoriesByGroup);

  const knownGroups = Array.from(
    new Set(activeCategories.map((category) => category.group)),
  ).sort(sortBudgetGroups);

  return {
    actualSpending,
    availableCategories,
    budget,
    expectedExpenses,
    expectedIncome,
    groups,
    knownGroups,
    overspentCategories,
    plannedNet,
  };
};
