import type { Account, Budget, Transaction } from "~/lib/schemas";

export const transactionCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const transactionBudgetMonthFormatter = new Intl.DateTimeFormat(
  "en-US",
  {
    month: "short",
    year: "numeric",
  },
);

export const transactionAccountTypeLabels: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  creditCard: "Credit card",
};

export const formatTransactionCurrency = (amount: number) =>
  transactionCurrencyFormatter.format(amount);

export const formatTransactionBudgetMonth = (
  budget: Pick<Budget, "month" | "year">,
) =>
  transactionBudgetMonthFormatter.format(
    new Date(budget.year, budget.month - 1, 1),
  );

export const formatTransactionDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseTransactionDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const getSignedBudgetImpact = (
  transaction: Pick<Transaction, "amount" | "type">,
) => (transaction.type === "credit" ? -transaction.amount : transaction.amount);
