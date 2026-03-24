import { motion } from "motion/react";
import {
  ArrowPathRoundedSquareIcon,
  PlusIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/20/solid";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { Account, BudgetItem, Transaction } from "../lib/schemas";

import { createTransaction } from "../hooks/transactions";
import {
  accountCollection,
  budgetCollection,
  budgetItemCollection,
  categoryCollection,
  transactionCollection,
} from "../lib/collections";
import { useLiveQuery } from "@tanstack/react-db";
import { TransactionTable, type TransactionTableRow } from "./TransactionTable";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "./ui/description-list";
import { Field, FieldGroup, Fieldset, Label, Legend } from "./ui/fieldset";
import { Heading, Subheading } from "./ui/heading";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Text } from "./ui/text";
import { Textarea } from "./ui/textarea";

type TransactionFormValues = {
  merchant: string;
  amount: string;
  notes: string;
  date: string;
  type: Transaction["type"];
  accountId: string;
  budgetItemId: string;
};

type BudgetItemOption = {
  id: BudgetItem["id"];
  label: string;
  groupName: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const budgetMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const accountTypeLabel: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  creditCard: "Credit card",
};

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const formatDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const emptyTransactionValues = (): TransactionFormValues => ({
  merchant: "",
  amount: "",
  notes: "",
  date: formatDateInputValue(new Date()),
  type: "debit",
  accountId: "",
  budgetItemId: "",
});

const getSignedBudgetImpact = (
  transaction: Pick<Transaction, "amount" | "type">,
) => {
  return transaction.type === "credit"
    ? -transaction.amount
    : transaction.amount;
};

export function TransactionsWorkspace() {
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

  const [createValues, setCreateValues] = useState<TransactionFormValues>(
    emptyTransactionValues,
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((left, right) => left.name.localeCompare(right.name)),
    [accounts],
  );

  const budgetItemOptions = useMemo(() => {
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
          label: `${category.name} · ${category.group} · ${budgetMonthFormatter.format(
            new Date(budget.year, budget.month - 1, 1),
          )}`,
        };
      })
      .filter((option): option is BudgetItemOption => option !== null)
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [budgetItems, budgets, categories]);

  useEffect(() => {
    setCreateValues((current) => {
      const nextAccountId =
        current.accountId &&
        sortedAccounts.some((account) => account.id === current.accountId)
          ? current.accountId
          : (sortedAccounts[0]?.id ?? "");

      if (nextAccountId === current.accountId) {
        return current;
      }

      return {
        ...current,
        accountId: nextAccountId,
      };
    });
  }, [sortedAccounts]);

  useEffect(() => {
    setCreateValues((current) => {
      const nextBudgetItemId =
        current.budgetItemId &&
        budgetItemOptions.some((option) => option.id === current.budgetItemId)
          ? current.budgetItemId
          : (budgetItemOptions[0]?.id ?? "");

      if (nextBudgetItemId === current.budgetItemId) {
        return current;
      }

      return {
        ...current,
        budgetItemId: nextBudgetItemId,
      };
    });
  }, [budgetItemOptions]);

  const transactionRows = useMemo(() => {
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
        const budget = budgetItem
          ? budgetById.get(budgetItem.budgetId)
          : undefined;

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
            ? accountTypeLabel[account.type]
            : "Account unavailable",
          categoryName: category?.name ?? "Missing category",
          groupName: category?.group ?? "Unassigned",
          budgetLabel: budget
            ? budgetMonthFormatter.format(
                new Date(budget.year, budget.month - 1, 1),
              )
            : "Budget unavailable",
        };
      })
      .sort(
        (left, right) =>
          right.date.getTime() - left.date.getTime() ||
          left.merchant.localeCompare(right.merchant),
      );
  }, [accounts, budgetItems, budgets, categories, transactions]);

  const debitTotal = transactionRows
    .filter((row) => row.type === "debit")
    .reduce((sum, row) => sum + row.amount, 0);

  const creditTotal = transactionRows
    .filter((row) => row.type === "credit")
    .reduce((sum, row) => sum + row.amount, 0);

  const netBudgetImpact = transactionRows.reduce(
    (sum, row) => sum + row.signedAmount,
    0,
  );

  const activeBudgetLines = new Set(
    transactionRows.map((row) => `${row.categoryName}:${row.budgetLabel}`),
  ).size;

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const merchant = createValues.merchant.trim();
    const amount = Number(createValues.amount);
    const date = parseDateInputValue(createValues.date);

    if (!merchant) {
      setCreateError("Merchant is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setCreateError("Amount must be a positive number.");
      return;
    }

    if (!date) {
      setCreateError("Transaction date is required.");
      return;
    }

    if (!createValues.accountId) {
      setCreateError("Select an account for this transaction.");
      return;
    }

    if (!createValues.budgetItemId) {
      setCreateError("Select the budget line this transaction belongs to.");
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const optimisticTransaction = createTransaction({
        transaction: {
          merchant,
          amount,
          notes: createValues.notes.trim(),
          date,
          type: createValues.type,
          accountId: createValues.accountId,
          budgetItemId: createValues.budgetItemId,
          recurringTemplateId: null,
        },
      });

      await optimisticTransaction.isPersisted.promise;

      setCreateValues((current) => ({
        ...current,
        merchant: "",
        amount: "",
        notes: "",
        date: formatDateInputValue(new Date()),
      }));
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Unable to create this transaction.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="grid gap-8 border-b border-zinc-950/6 pb-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,30rem)] dark:border-white/8"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Heading>Transactions</Heading>
            <Text>
              Post activity into the ledger, keep budget actuals honest, and
              scan the full transaction stream without leaving the workspace.
            </Text>
          </div>

          <DescriptionList className="max-w-3xl [&>dd]:pb-2.5 [&>dd]:pt-0.5 [&>dt]:pt-2.5 sm:[&>dd]:py-2.5 sm:[&>dt]:py-2.5">
            <DescriptionTerm>Total transactions</DescriptionTerm>
            <DescriptionDetails>{transactionRows.length}</DescriptionDetails>

            <DescriptionTerm>Debit flow</DescriptionTerm>
            <DescriptionDetails>
              {formatCurrency(debitTotal)}
            </DescriptionDetails>

            <DescriptionTerm>Credit flow</DescriptionTerm>
            <DescriptionDetails className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(creditTotal)}
            </DescriptionDetails>

            <DescriptionTerm>Net budget impact</DescriptionTerm>
            <DescriptionDetails
              className={
                netBudgetImpact >= 0
                  ? "font-medium text-zinc-950 dark:text-white"
                  : "font-medium text-emerald-600 dark:text-emerald-400"
              }
            >
              {formatCurrency(netBudgetImpact)}
            </DescriptionDetails>
          </DescriptionList>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-950/8 px-4 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Badge color="sky">
                  <ArrowPathRoundedSquareIcon className="size-4" />
                  Live sync
                </Badge>
              </div>
              <Text className="mt-2.5">
                Debits raise the selected budget line’s actual spend. Credits
                reduce it immediately in the client before the API round-trip
                finishes.
              </Text>
            </div>

            <div className="rounded-2xl border border-zinc-950/8 px-4 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Badge color="amber">
                  <ReceiptPercentIcon className="size-4" />
                  Budget lines touched
                </Badge>
              </div>
              <div className="mt-2.5 font-medium text-zinc-950 dark:text-white">
                {activeBudgetLines}
              </div>
              <Text>
                Distinct budget lines with posted transaction activity.
              </Text>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-zinc-950/8 bg-zinc-50/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/4"
        >
          <Fieldset>
            <Legend>Create transaction</Legend>
            <Text className="mt-1">
              Every new transaction posts to one budget line and updates that
              line’s actual amount optimistically.
            </Text>

            <FieldGroup className="mt-6">
              <Field>
                <Label>Merchant</Label>
                <Input
                  value={createValues.merchant}
                  onChange={(event) =>
                    setCreateValues((current) => ({
                      ...current,
                      merchant: event.target.value,
                    }))
                  }
                  placeholder="H-E-B, rent, payroll"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={createValues.date}
                    onChange={(event) =>
                      setCreateValues((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field>
                  <Label>Type</Label>
                  <Select
                    value={createValues.type}
                    onChange={(event) =>
                      setCreateValues((current) => ({
                        ...current,
                        type: event.target.value as Transaction["type"],
                      }))
                    }
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <Label>Account</Label>
                  <Select
                    value={createValues.accountId}
                    onChange={(event) =>
                      setCreateValues((current) => ({
                        ...current,
                        accountId: event.target.value,
                      }))
                    }
                    disabled={sortedAccounts.length === 0}
                  >
                    {sortedAccounts.length === 0 ? (
                      <option value="">No accounts available</option>
                    ) : null}
                    {sortedAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={createValues.amount}
                    onChange={(event) =>
                      setCreateValues((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </Field>
              </div>

              <Field>
                <Label>Budget line</Label>
                <Select
                  value={createValues.budgetItemId}
                  onChange={(event) =>
                    setCreateValues((current) => ({
                      ...current,
                      budgetItemId: event.target.value,
                    }))
                  }
                  disabled={budgetItemOptions.length === 0}
                >
                  {budgetItemOptions.length === 0 ? (
                    <option value="">No budget lines available</option>
                  ) : null}
                  {budgetItemOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label>Notes</Label>
                <Textarea
                  value={createValues.notes}
                  onChange={(event) =>
                    setCreateValues((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional memo or reconciliation note"
                  rows={4}
                />
              </Field>

              {createError ? (
                <Text className="text-red-600 dark:text-red-400">
                  {createError}
                </Text>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Text>
                  {sortedAccounts.length === 0
                    ? "Add an account before posting transactions."
                    : budgetItemOptions.length === 0
                      ? "Add a budget line before posting transactions."
                      : "Debits add to actual spend. Credits pull actual spend back down."}
                </Text>
                <Button
                  type="submit"
                  color="dark/zinc"
                  disabled={
                    isCreating ||
                    sortedAccounts.length === 0 ||
                    budgetItemOptions.length === 0
                  }
                >
                  <PlusIcon data-slot="icon" />
                  Add transaction
                </Button>
              </div>
            </FieldGroup>
          </Fieldset>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Subheading>Transaction ledger</Subheading>
          <Text>
            Search, sort, and filter the full history while keeping the budget
            impact visible in the same row.
          </Text>
        </div>

        <TransactionTable rows={transactionRows} />
      </motion.section>
    </div>
  );
}
