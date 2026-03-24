import type { BudgetItem } from "./schemas";

import type { BulkTransactionPreviewRow } from "./api";

export type BulkBudgetItemOption = {
  id: BudgetItem["id"];
  label: string;
  categoryName: string;
  groupName: string;
  budgetLabel: string;
  budgetMonth: number;
  budgetYear: number;
};

export type BulkTransactionDraftRow = BulkTransactionPreviewRow & {
  initialBudgetItemId: BudgetItem["id"] | null;
  selected: boolean;
  dirty: boolean;
};

const getIssueMessages = (row: BulkTransactionDraftRow) => {
  const issues = [...row.errors];

  if (!row.accountId) {
    issues.push("Missing account assignment from the import preview.");
  }

  if (!row.budgetItemId) {
    issues.push("Assign a budget line before uploading.");
  }

  return issues;
};

export const isBulkTransactionReady = (row: BulkTransactionDraftRow) => {
  return getIssueMessages(row).length === 0;
};

export const getBudgetItemOptionDateKey = ({
  budgetMonth,
  budgetYear,
}: Pick<BulkBudgetItemOption, "budgetMonth" | "budgetYear">) => {
  return `${budgetYear}-${budgetMonth}`;
};

export const getTransactionDateKey = (date: Date) => {
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
};

export const filterBudgetItemOptionsByTransactionDate = ({
  budgetItemId,
  options,
  transactionDate,
}: {
  budgetItemId?: BudgetItem["id"] | null;
  options: BulkBudgetItemOption[];
  transactionDate: Date;
}) => {
  const transactionDateKey = getTransactionDateKey(transactionDate);
  const matchedOptions = options.filter(
    (option) => getBudgetItemOptionDateKey(option) === transactionDateKey,
  );

  if (matchedOptions.length === 0) {
    return options;
  }

  if (!budgetItemId) {
    return matchedOptions;
  }

  const selectedOption = options.find((option) => option.id === budgetItemId);
  if (
    !selectedOption ||
    matchedOptions.some((option) => option.id === selectedOption.id)
  ) {
    return matchedOptions;
  }

  return [...matchedOptions, selectedOption].sort((left, right) =>
    left.label.localeCompare(right.label),
  );
};
