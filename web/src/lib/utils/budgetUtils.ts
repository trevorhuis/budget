import type { Budget, BudgetItem, Category } from "~/lib/schemas";

export type BudgetRowStatus =
  | "funded"
  | "pending"
  | "on-track"
  | "tight"
  | "overspent";

export type BudgetRow = {
  budgetItem: BudgetItem;
  category: Category;
  group: string;
  isIncome: boolean;
  variance: number;
  status: BudgetRowStatus;
};

export type BudgetGroup = {
  actualAmount: number;
  group: string;
  isIncome: boolean;
  rows: BudgetRow[];
  targetAmount: number;
};

export type MonthlyBudgetPageData = {
  actualSpending: number;
  availableCategories: Category[];
  budget: Budget | null;
  expectedExpenses: number;
  expectedIncome: number;
  groups: BudgetGroup[];
  knownGroups: string[];
  overspentCategories: BudgetRow[];
  plannedNet: number;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const fallbackMonth = (fallbackDate = new Date()) => ({
  month: fallbackDate.getMonth() + 1,
  year: fallbackDate.getFullYear(),
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatMonthInputValue = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

export const parseMonthInputValue = (
  value: string,
  fallbackDate = new Date(),
) => {
  const parsedValue = /^(\d{4})-(\d{2})$/.exec(value);

  if (!parsedValue) {
    return fallbackMonth(fallbackDate);
  }

  const year = Number(parsedValue[1]);
  const month = Number(parsedValue[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return fallbackMonth(fallbackDate);
  }

  if (month < 1 || month > 12) {
    return fallbackMonth(fallbackDate);
  }

  return { month, year };
};

export const formatMonthLabel = (month: number, year: number) =>
  monthFormatter.format(new Date(year, month - 1, 1));

export const parseAmountInput = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
};

export const getBudgetGroupSortOrder = (group: string) => {
  if (group === "Income") {
    return 0;
  }

  return 1;
};

export const sortBudgetGroups = <TGroup extends string>(
  left: TGroup,
  right: TGroup,
) => {
  const groupDifference =
    getBudgetGroupSortOrder(left) - getBudgetGroupSortOrder(right) ||
    left.localeCompare(right);

  return groupDifference;
};

export const sortCategoriesByGroup = <
  TCategory extends Pick<Category, "group" | "name">,
>(
  left: TCategory,
  right: TCategory,
) => {
  const groupDifference =
    sortBudgetGroups(left.group, right.group) ||
    left.name.localeCompare(right.name);

  return groupDifference;
};

export const getExpenseStatus = (budgetItem: BudgetItem) => {
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

export const getIncomeStatus = (budgetItem: BudgetItem) => {
  if (budgetItem.actualAmount >= budgetItem.targetAmount) {
    return "funded" as const;
  }

  return "pending" as const;
};

export const getBudgetStatusBadge = (row: Pick<BudgetRow, "isIncome" | "status">) => {
  if (row.isIncome) {
    return row.status === "funded"
      ? { color: "emerald" as const, label: "Funded" }
      : { color: "amber" as const, label: "Pending" };
  }

  switch (row.status) {
    case "overspent":
      return { color: "rose" as const, label: "Overspent" };
    case "tight":
      return { color: "amber" as const, label: "Tight" };
    default:
      return { color: "emerald" as const, label: "On track" };
  }
};

export const getBudgetVarianceLabel = (
  row: Pick<BudgetRow, "isIncome" | "variance">,
) => {
  if (row.isIncome) {
    return row.variance >= 0
      ? `${formatCurrency(row.variance)} short`
      : `${formatCurrency(Math.abs(row.variance))} ahead`;
  }

  return row.variance >= 0
    ? `${formatCurrency(row.variance)} left`
    : `${formatCurrency(Math.abs(row.variance))} over`;
};

export const getBudgetGroupTone = (isIncome: boolean) =>
  isIncome
    ? {
        bar: "bg-emerald-500 dark:bg-emerald-400",
        border: "border-emerald-500/20 dark:border-emerald-400/20",
        chip: "emerald" as const,
      }
    : {
        bar: "bg-amber-500 dark:bg-amber-400",
        border: "border-zinc-950/8 dark:border-white/10",
        chip: "zinc" as const,
      };
