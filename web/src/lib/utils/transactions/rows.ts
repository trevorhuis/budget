import type { TransactionTableRow } from "~/components/transactions/TransactionTable";
import type { Account, Budget, BudgetItem, Category, Transaction } from "~/lib/schemas";
import {
  formatTransactionBudgetMonth,
  getSignedBudgetImpact,
  transactionAccountTypeLabels,
} from "~/lib/utils/transactions/format";

export const mapTransactionsToRows = ({
  accounts,
  budgetItems,
  budgets,
  categories,
  transactions,
}: {
  accounts: readonly Account[];
  budgetItems: readonly BudgetItem[];
  budgets: readonly Budget[];
  categories: readonly Category[];
  transactions: readonly Transaction[];
}): TransactionTableRow[] => {
  const accountById = new Map(
    accounts.map((account) => [account.id, account] as const),
  );
  const budgetItemById = new Map(
    budgetItems.map((budgetItem) => [budgetItem.id, budgetItem] as const),
  );
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const budgetById = new Map(
    budgets.map((budget) => [budget.id, budget] as const),
  );

  return [...transactions]
    .map((transaction): TransactionTableRow => {
      const account = accountById.get(transaction.accountId);
      const budgetItem = budgetItemById.get(transaction.budgetItemId);
      const category = budgetItem
        ? categoryById.get(budgetItem.categoryId)
        : undefined;
      const budget = budgetItem ? budgetById.get(budgetItem.budgetId) : undefined;

      return {
        id: transaction.id,
        merchant: transaction.merchant,
        notes: transaction.notes,
        type: transaction.type,
        amount: transaction.amount,
        signedAmount: getSignedBudgetImpact(transaction),
        date: transaction.date,
        accountName: account?.name ?? "Unknown account",
        accountTypeLabel: account
          ? transactionAccountTypeLabels[account.type]
          : "Account unavailable",
        categoryName: category?.name ?? "Missing category",
        groupName: category?.group ?? "Unassigned",
        budgetLabel: budget
          ? formatTransactionBudgetMonth(budget)
          : "Budget unavailable",
      };
    })
    .sort(
      (left, right) =>
        right.date.getTime() - left.date.getTime() ||
        left.merchant.localeCompare(right.merchant),
    );
};

export const getTransactionSummary = (rows: readonly TransactionTableRow[]) => {
  const debitTotal = rows
    .filter((row) => row.type === "debit")
    .reduce((sum, row) => sum + row.amount, 0);

  const creditTotal = rows
    .filter((row) => row.type === "credit")
    .reduce((sum, row) => sum + row.amount, 0);

  const netBudgetImpact = rows.reduce((sum, row) => sum + row.signedAmount, 0);

  return {
    creditTotal,
    debitTotal,
    netBudgetImpact,
  };
};
