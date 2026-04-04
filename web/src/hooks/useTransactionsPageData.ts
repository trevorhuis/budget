import { useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";
import { accountCollection } from "~/lib/collections/accountCollection";
import { budgetCollection } from "~/lib/collections/budgetCollection";
import { budgetItemCollection } from "~/lib/collections/budgetItemCollection";
import { categoryCollection } from "~/lib/collections/categoryCollection";
import { transactionCollection } from "~/lib/collections/transactionCollection";
import {
  buildTransactionAccountOptions,
  buildTransactionBudgetLineOptions,
} from "~/lib/utils/transactions/options";
import {
  getTransactionSummary,
  mapTransactionsToRows,
} from "~/lib/utils/transactions/rows";

export const useTransactionsPageData = () => {
  const { data: accounts = [] } = useLiveQuery((q) =>
    q.from({ account: accountCollection }),
  );
  const { data: budgets = [] } = useLiveQuery((q) =>
    q.from({ budget: budgetCollection }),
  );
  const { data: budgetItems = [] } = useLiveQuery((q) =>
    q.from({ budgetItem: budgetItemCollection }),
  );
  const { data: categories = [] } = useLiveQuery((q) =>
    q.from({ category: categoryCollection }),
  );
  const { data: transactions = [] } = useLiveQuery((q) =>
    q.from({ transaction: transactionCollection }),
  );

  const accountOptions = useMemo(
    () => buildTransactionAccountOptions(accounts),
    [accounts],
  );

  const budgetLineOptions = useMemo(
    () =>
      buildTransactionBudgetLineOptions({
        budgetItems,
        budgets,
        categories,
      }),
    [budgetItems, budgets, categories],
  );

  const transactionRows = useMemo(
    () =>
      mapTransactionsToRows({
        accounts,
        budgetItems,
        budgets,
        categories,
        transactions,
      }),
    [accounts, budgetItems, budgets, categories, transactions],
  );

  const summary = useMemo(
    () => ({
      totalTransactions: transactionRows.length,
      ...getTransactionSummary(transactionRows),
    }),
    [transactionRows],
  );

  return {
    accountOptions,
    budgetLineOptions,
    summary,
    transactionRows,
  };
};
