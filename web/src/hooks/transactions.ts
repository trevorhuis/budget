import { createOptimisticAction } from "@tanstack/react-db";
import { uuidv7 } from "uuidv7";
import type { Account, BudgetItem, Transaction } from "../lib/schemas";

import { API } from "../lib/api";
import {
  accountCollection,
  budgetItemCollection,
  transactionCollection,
} from "../lib/collections";

type CreateTransactionInput = Pick<
  Transaction,
  | "merchant"
  | "amount"
  | "notes"
  | "date"
  | "type"
  | "accountId"
  | "budgetItemId"
  | "recurringTemplateId"
>;

type CollectionMutation<TItem> = {
  collection: unknown;
  modified: TItem;
  original?: TItem;
};

const getSignedAmount = (transaction: Pick<Transaction, "amount" | "type">) => {
  return transaction.type === "credit"
    ? -transaction.amount
    : transaction.amount;
};

const getBudgetItem = (budgetItemId: BudgetItem["id"]) => {
  const budgetItem = budgetItemCollection.get(budgetItemId);

  if (!budgetItem) {
    throw new Error(`Budget item ${budgetItemId} not found`);
  }

  return budgetItem;
};

const getAccount = (accountId: Account["id"]) => {
  const account = accountCollection.get(accountId);

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  return account;
};

const normalizeTransactionCreate = (transaction: Transaction) => ({
  id: transaction.id,
  merchant: transaction.merchant,
  amount: transaction.amount,
  notes: transaction.notes,
  date: transaction.date,
  type: transaction.type,
  accountId: transaction.accountId,
  budgetItemId: transaction.budgetItemId,
  recurringTemplateId: transaction.recurringTemplateId ?? null,
});

const persistBudgetItemUpdates = async (
  mutations: Array<CollectionMutation<BudgetItem>>,
) => {
  await Promise.all(
    mutations.map(({ modified }) =>
      API.budgetItems.update(modified.id, {
        actualAmount: modified.actualAmount,
        targetAmount: modified.targetAmount,
      }),
    ),
  );
};

export const createTransaction = createOptimisticAction<{
  transaction: CreateTransactionInput;
}>({
  onMutate: ({ transaction }) => {
    const budgetItem = getBudgetItem(transaction.budgetItemId);
    const account = getAccount(transaction.accountId);

    transactionCollection.insert({
      ...transaction,
      id: uuidv7(),
      userId: account.userId,
      recurringTemplateId: transaction.recurringTemplateId ?? null,
    });

    budgetItemCollection.update(budgetItem.id, (draft) => {
      draft.actualAmount += getSignedAmount(transaction);
    });
  },
  mutationFn: async (_variables, params) => {
    const mutations = params.transaction.mutations as unknown as Array<
      CollectionMutation<Transaction> | CollectionMutation<BudgetItem>
    >;

    const transactionMutation = mutations.find(
      (mutation) => mutation.collection === transactionCollection,
    ) as CollectionMutation<Transaction> | undefined;

    const budgetItemMutations = mutations.filter(
      (mutation) => mutation.collection === budgetItemCollection,
    ) as CollectionMutation<BudgetItem>[];

    if (!transactionMutation) {
      throw new Error("Optimistic transaction mutation not found");
    }

    await Promise.all([
      API.transactions.create(
        normalizeTransactionCreate(transactionMutation.modified),
      ),
      persistBudgetItemUpdates(budgetItemMutations),
    ]);

    await Promise.all([
      transactionCollection.utils.refetch(),
      budgetItemCollection.utils.refetch(),
    ]);
  },
});
