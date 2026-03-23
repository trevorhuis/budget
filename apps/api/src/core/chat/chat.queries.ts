import {
  getAccountsByUser,
  getAccountByUserAndId,
} from "../account/account.repository.js";
import {
  getBudgetByUserAndId,
  getBudgetsByUser,
} from "../budget/budget.repository.js";
import {
  getBudgetItemByUserAndId,
  getBudgetItemsByUser,
} from "../budgetItem/budgetItem.repository.js";
import {
  getCategoriesByUser,
  getCategoryByUserAndId,
} from "../category/category.repository.js";
import {
  getTransactionsByUser,
  getTransactionByUserAndId,
} from "../transaction/transaction.repository.js";
import {
  getRecurringTransactionByUser,
  getRecurringTransactionByUserAndId,
} from "../transactionRecurring/transactionRecurring.repository.js";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const RECENT_TRANSACTION_LIMIT = 10;

type SortDirection = "asc" | "desc";

export type BudgetSummary = {
  id: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
};

export type CategorySummary = {
  id: string;
  name: string;
  group: string;
  status: string;
};

export type BudgetItemBudgetSummary = {
  id: string;
  month: number;
  year: number;
};

export type BudgetItemSummary = {
  id: string;
  actualAmount: number;
  targetAmount: number;
  variance: number;
  budget: BudgetItemBudgetSummary;
  category: CategorySummary;
  transactionCount: number;
  latestTransactionDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetDetail = BudgetSummary & {
  itemCount: number;
  targetTotal: number;
  actualTotal: number;
  varianceTotal: number;
  budgetItems: BudgetItemSummary[];
};

export type AccountSummary = {
  id: string;
  name: string;
  type: "savings" | "checking" | "creditCard";
  balance: number;
};

export type RecurringTemplateSummary = {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  recurringDate: number;
  category: CategorySummary | null;
};

export type TransactionSummary = {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  type: "debit" | "credit";
  date: string;
  createdAt: string;
  updatedAt: string;
  account: AccountSummary | null;
  budgetItem: (BudgetItemSummary & { budgetId: string; categoryId: string }) | null;
  budget: BudgetItemBudgetSummary | null;
  recurringTemplate: RecurringTemplateSummary | null;
};

export type BudgetItemDetail = BudgetItemSummary & {
  budgetId: string;
  categoryId: string;
  recentTransactions: TransactionSummary[];
};

export type BudgetItemSpendAnalysis = {
  budgetItemId: string;
  targetAmount: number;
  actualAmount: number;
  variance: number;
  percentUsed: number;
  transactionCount: number;
  creditTotal: number;
  debitTotal: number;
  topMerchants: Array<{
    merchant: string;
    netAmount: number;
    absoluteNetAmount: number;
    debitTotal: number;
    creditTotal: number;
    transactionCount: number;
  }>;
};

export type TransactionSummaryGroupBy = "merchant" | "budgetItem" | "account" | "type";

export type TransactionSummaryRow = {
  groupKey: string;
  label: string;
  transactionCount: number;
  debitTotal: number;
  creditTotal: number;
  netTotal: number;
};

export type TransactionSummaryResult = {
  groupBy: TransactionSummaryGroupBy;
  transactionCount: number;
  debitTotal: number;
  creditTotal: number;
  netTotal: number;
  groups: TransactionSummaryRow[];
};

export type RecurringTransactionSummary = {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  recurringDate: number;
  createdAt: string;
  updatedAt: string;
  category: CategorySummary | null;
};

export type RecurringTransactionDetail = RecurringTransactionSummary & {
  realizedTransactionCount: number;
  latestRealizedTransactionDate: string | null;
};

export type RecurringCommitmentSummary = {
  templateCount: number;
  estimatedMonthlyTotal: number;
  byCategory: Array<{
    categoryId: string | null;
    label: string;
    templateCount: number;
    totalAmount: number;
  }>;
  byRecurringDate: Array<{
    recurringDate: number;
    templateCount: number;
    totalAmount: number;
  }>;
};

type TransactionFilters = {
  budgetId?: string;
  budgetItemId?: string;
  accountId?: string;
  type?: "debit" | "credit";
  startDate?: string;
  endDate?: string;
  merchantQuery?: string;
  recurringOnly?: boolean;
  limit?: number;
};

const clampLimit = (value?: number) => {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(MAX_LIMIT, value));
};

const toIsoString = (value: Date | string | undefined | null) => {
  if (value === null || value === undefined) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const ensureDate = (value: Date | string) => {
  return value instanceof Date ? value : new Date(value);
};

const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseStartDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const normalized = isDateOnly(value) ? `${value}T00:00:00.000Z` : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid startDate: ${value}`);
  }

  return date;
};

const parseEndDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const normalized = isDateOnly(value) ? `${value}T23:59:59.999Z` : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid endDate: ${value}`);
  }

  return date;
};

const sortByDate = <T>(
  values: T[],
  getValue: (value: T) => Date | string,
  direction: SortDirection = "desc",
) => {
  const factor = direction === "asc" ? 1 : -1;

  return [...values].sort((left, right) => {
    const leftTime = ensureDate(getValue(left)).getTime();
    const rightTime = ensureDate(getValue(right)).getTime();

    return (leftTime - rightTime) * factor;
  });
};

const mapById = <T extends { id: string }>(values: T[]) => {
  return new Map(values.map((value) => [value.id, value]));
};

const getSignedAmount = (transaction: { amount: number; type: "debit" | "credit" }) => {
  return transaction.type === "debit" ? transaction.amount : -transaction.amount;
};

const createCategorySummary = (
  category:
    | {
        id: string;
        name: string;
        group: string;
        status: string;
      }
    | null
    | undefined,
): CategorySummary | null => {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    group: category.group,
    status: category.status,
  };
};

const createBudgetSummary = (budget: {
  id: string;
  month: number;
  year: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): BudgetSummary => ({
  id: budget.id,
  month: budget.month,
  year: budget.year,
  createdAt: toIsoString(budget.createdAt) ?? "",
  updatedAt: toIsoString(budget.updatedAt) ?? "",
});

const createBudgetItemBudgetSummary = (budget: {
  id: string;
  month: number;
  year: number;
}): BudgetItemBudgetSummary => ({
  id: budget.id,
  month: budget.month,
  year: budget.year,
});

const createAccountSummary = (
  account:
    | {
        id: string;
        name: string;
        type: "savings" | "checking" | "creditCard";
        balance: number;
      }
    | null
    | undefined,
): AccountSummary | null => {
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
  };
};

const createRecurringTransactionSummary = (
  template:
    | {
        id: string;
        merchant: string;
        amount: number;
        notes: string;
        recurringDate: number;
        createdAt?: Date | string;
        updatedAt?: Date | string;
        categoryId: string;
      }
    | null
    | undefined,
  categoryMap: Map<string, CategorySummary>,
): RecurringTransactionSummary | null => {
  if (!template) {
    return null;
  }

  return {
    id: template.id,
    merchant: template.merchant,
    amount: template.amount,
    notes: template.notes,
    recurringDate: template.recurringDate,
    createdAt: toIsoString(template.createdAt) ?? "",
    updatedAt: toIsoString(template.updatedAt) ?? "",
    category: categoryMap.get(template.categoryId) ?? null,
  };
};

const buildBudgetItemSummary = (
  budgetItem: {
    id: string;
    actualAmount: number;
    targetAmount: number;
    budgetId: string;
    categoryId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  },
  budgetMap: Map<string, { id: string; month: number; year: number }>,
  categoryMap: Map<string, CategorySummary>,
  transactionsByBudgetItemId: Map<string, Array<{ date: Date | string }>>,
): BudgetItemSummary & { budgetId: string; categoryId: string } => {
  const budget = budgetMap.get(budgetItem.budgetId);
  const category = categoryMap.get(budgetItem.categoryId);

  if (!budget || !category) {
    throw new Error(`Budget item ${budgetItem.id} is missing related budget or category`);
  }

  const relatedTransactions = transactionsByBudgetItemId.get(budgetItem.id) ?? [];
  const latestTransaction = sortByDate(relatedTransactions, (transaction) => transaction.date)[0];

  return {
    id: budgetItem.id,
    actualAmount: budgetItem.actualAmount,
    targetAmount: budgetItem.targetAmount,
    variance: budgetItem.targetAmount - budgetItem.actualAmount,
    budgetId: budgetItem.budgetId,
    categoryId: budgetItem.categoryId,
    budget: createBudgetItemBudgetSummary(budget),
    category,
    transactionCount: relatedTransactions.length,
    latestTransactionDate: latestTransaction ? toIsoString(latestTransaction.date) : null,
    createdAt: toIsoString(budgetItem.createdAt) ?? "",
    updatedAt: toIsoString(budgetItem.updatedAt) ?? "",
  };
};

const buildTransactionSummary = (
  transaction: {
    id: string;
    merchant: string;
    amount: number;
    notes: string;
    type: "debit" | "credit";
    date: Date | string;
    accountId: string;
    budgetItemId: string;
    recurringTemplateId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  },
  accountMap: Map<string, AccountSummary>,
  budgetItemMap: Map<string, BudgetItemSummary & { budgetId: string; categoryId: string }>,
  recurringTemplateMap: Map<string, RecurringTransactionSummary>,
): TransactionSummary => {
  const budgetItem = budgetItemMap.get(transaction.budgetItemId) ?? null;
  const budget = budgetItem?.budget ?? null;
  const recurringTemplate = transaction.recurringTemplateId
    ? (recurringTemplateMap.get(transaction.recurringTemplateId) ?? null)
    : null;

  return {
    id: transaction.id,
    merchant: transaction.merchant,
    amount: transaction.amount,
    notes: transaction.notes,
    type: transaction.type,
    date: toIsoString(transaction.date) ?? "",
    createdAt: toIsoString(transaction.createdAt) ?? "",
    updatedAt: toIsoString(transaction.updatedAt) ?? "",
    account: accountMap.get(transaction.accountId) ?? null,
    budgetItem,
    budget,
    recurringTemplate,
  };
};

async function getUserData(userId: string) {
  const [budgets, budgetItems, categories, accounts, transactions, recurringTransactions] =
    await Promise.all([
      getBudgetsByUser(userId),
      getBudgetItemsByUser(userId),
      getCategoriesByUser(userId),
      getAccountsByUser(userId),
      getTransactionsByUser(userId),
      getRecurringTransactionByUser(userId),
    ]);

  const budgetMap = mapById(budgets);
  const categoryMap = mapById(categories.map((category) => createCategorySummary(category)!));
  const accountMap = mapById(accounts.map((account) => createAccountSummary(account)!));
  const transactionsByBudgetItemId = new Map<string, typeof transactions>();

  for (const transaction of transactions) {
    const current = transactionsByBudgetItemId.get(transaction.budgetItemId) ?? [];
    current.push(transaction);
    transactionsByBudgetItemId.set(transaction.budgetItemId, current);
  }

  const budgetItemSummaries = budgetItems.map((budgetItem) =>
    buildBudgetItemSummary(budgetItem, budgetMap, categoryMap, transactionsByBudgetItemId),
  );
  const budgetItemMap = mapById(budgetItemSummaries);

  const recurringTemplateSummaries = recurringTransactions
    .map((template) => createRecurringTransactionSummary(template, categoryMap))
    .filter((template): template is RecurringTransactionSummary => template !== null);
  const recurringTemplateMap = mapById(recurringTemplateSummaries);

  return {
    budgets,
    budgetMap,
    budgetItems,
    budgetItemSummaries,
    budgetItemMap,
    categories,
    categoryMap,
    accounts,
    accountMap,
    transactions,
    recurringTransactions,
    recurringTemplateMap,
  };
}

const filterTransactions = (
  transactions: Array<{
    id: string;
    merchant: string;
    amount: number;
    notes: string;
    date: Date | string;
    accountId: string;
    budgetItemId: string;
    type: "debit" | "credit";
    recurringTemplateId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }>,
  budgetItemMap: Map<string, { budgetId: string }>,
  filters: TransactionFilters,
) => {
  const startDate = parseStartDate(filters.startDate);
  const endDate = parseEndDate(filters.endDate);
  const merchantQuery = filters.merchantQuery?.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (filters.budgetItemId && transaction.budgetItemId !== filters.budgetItemId) {
      return false;
    }

    if (filters.accountId && transaction.accountId !== filters.accountId) {
      return false;
    }

    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    if (filters.recurringOnly && (transaction.recurringTemplateId ?? null) === null) {
      return false;
    }

    if (filters.budgetId) {
      const budgetItem = budgetItemMap.get(transaction.budgetItemId);
      if (!budgetItem || budgetItem.budgetId !== filters.budgetId) {
        return false;
      }
    }

    if (merchantQuery && !transaction.merchant.toLowerCase().includes(merchantQuery)) {
      return false;
    }

    const transactionDate = ensureDate(transaction.date);

    if (startDate && transactionDate < startDate) {
      return false;
    }

    if (endDate && transactionDate > endDate) {
      return false;
    }

    return true;
  });
};

export async function listBudgets(
  userId: string,
  filters: { month?: number; year?: number; limit?: number },
): Promise<BudgetSummary[]> {
  const budgets = await getBudgetsByUser(userId);

  return budgets
    .filter((budget) => (filters.month === undefined ? true : budget.month === filters.month))
    .filter((budget) => (filters.year === undefined ? true : budget.year === filters.year))
    .sort((left, right) => {
      if (right.year !== left.year) {
        return right.year - left.year;
      }

      if (right.month !== left.month) {
        return right.month - left.month;
      }

      return (
        ensureDate(right.createdAt ?? new Date(0)).getTime() -
        ensureDate(left.createdAt ?? new Date(0)).getTime()
      );
    })
    .slice(0, clampLimit(filters.limit))
    .map(createBudgetSummary);
}

export async function getBudget(userId: string, budgetId: string): Promise<BudgetDetail> {
  const budget = await getBudgetByUserAndId(userId, budgetId);
  if (!budget) {
    throw new Error(`Budget ${budgetId} not found`);
  }

  const { budgetItemSummaries } = await getUserData(userId);
  const items = budgetItemSummaries.filter((item) => item.budgetId === budgetId);

  return {
    ...createBudgetSummary(budget),
    itemCount: items.length,
    targetTotal: items.reduce((sum, item) => sum + item.targetAmount, 0),
    actualTotal: items.reduce((sum, item) => sum + item.actualAmount, 0),
    varianceTotal: items.reduce((sum, item) => sum + item.variance, 0),
    budgetItems: items,
  };
}

export async function listBudgetItems(
  userId: string,
  filters: { budgetId?: string; categoryId?: string; limit?: number },
): Promise<BudgetItemSummary[]> {
  const { budgetItemSummaries } = await getUserData(userId);

  return budgetItemSummaries
    .filter((item) => (filters.budgetId === undefined ? true : item.budgetId === filters.budgetId))
    .filter((item) =>
      filters.categoryId === undefined ? true : item.categoryId === filters.categoryId,
    )
    .sort(
      (left, right) =>
        ensureDate(right.updatedAt ?? right.createdAt ?? new Date(0)).getTime() -
        ensureDate(left.updatedAt ?? left.createdAt ?? new Date(0)).getTime(),
    )
    .slice(0, clampLimit(filters.limit))
    .map(({ budgetId: _budgetId, categoryId: _categoryId, ...item }) => item);
}

export async function getBudgetItem(
  userId: string,
  budgetItemId: string,
): Promise<BudgetItemDetail> {
  const budgetItem = await getBudgetItemByUserAndId(userId, budgetItemId);
  if (!budgetItem) {
    throw new Error(`Budget item ${budgetItemId} not found`);
  }

  const { budgetItemMap, accountMap, recurringTemplateMap, transactions } = await getUserData(userId);
  const summary = budgetItemMap.get(budgetItemId);
  if (!summary) {
    throw new Error(`Budget item ${budgetItemId} not found`);
  }

  const recentTransactions = filterTransactions(transactions, budgetItemMap, { budgetItemId })
    .sort((left, right) => ensureDate(right.date).getTime() - ensureDate(left.date).getTime())
    .slice(0, RECENT_TRANSACTION_LIMIT)
    .map((transaction) =>
      buildTransactionSummary(transaction, accountMap, budgetItemMap, recurringTemplateMap),
    );

  return {
    ...summary,
    recentTransactions,
  };
}

export async function analyzeBudgetItemSpend(
  userId: string,
  budgetItemId: string,
): Promise<BudgetItemSpendAnalysis> {
  const budgetItem = await getBudgetItemByUserAndId(userId, budgetItemId);
  if (!budgetItem) {
    throw new Error(`Budget item ${budgetItemId} not found`);
  }

  const { transactions } = await getUserData(userId);
  const relevantTransactions = transactions.filter((transaction) => transaction.budgetItemId === budgetItemId);
  const debitTotal = relevantTransactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const creditTotal = relevantTransactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const merchantMap = new Map<
    string,
    {
      merchant: string;
      netAmount: number;
      debitTotal: number;
      creditTotal: number;
      transactionCount: number;
    }
  >();

  for (const transaction of relevantTransactions) {
    const current = merchantMap.get(transaction.merchant) ?? {
      merchant: transaction.merchant,
      netAmount: 0,
      debitTotal: 0,
      creditTotal: 0,
      transactionCount: 0,
    };

    current.netAmount += getSignedAmount(transaction);
    current.transactionCount += 1;

    if (transaction.type === "debit") {
      current.debitTotal += transaction.amount;
    } else {
      current.creditTotal += transaction.amount;
    }

    merchantMap.set(transaction.merchant, current);
  }

  return {
    budgetItemId,
    targetAmount: budgetItem.targetAmount,
    actualAmount: budgetItem.actualAmount,
    variance: budgetItem.targetAmount - budgetItem.actualAmount,
    percentUsed: budgetItem.targetAmount === 0
      ? 0
      : (budgetItem.actualAmount / budgetItem.targetAmount) * 100,
    transactionCount: relevantTransactions.length,
    creditTotal,
    debitTotal,
    topMerchants: [...merchantMap.values()]
      .map((merchant) => ({
        ...merchant,
        absoluteNetAmount: Math.abs(merchant.netAmount),
      }))
      .sort((left, right) => right.absoluteNetAmount - left.absoluteNetAmount)
      .slice(0, 5),
  };
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilters,
): Promise<TransactionSummary[]> {
  const {
    accountMap,
    budgetItemMap,
    recurringTemplateMap,
    transactions,
  } = await getUserData(userId);

  return filterTransactions(transactions, budgetItemMap, filters)
    .sort((left, right) => ensureDate(right.date).getTime() - ensureDate(left.date).getTime())
    .slice(0, clampLimit(filters.limit))
    .map((transaction) =>
      buildTransactionSummary(transaction, accountMap, budgetItemMap, recurringTemplateMap),
    );
}

export async function getTransaction(
  userId: string,
  transactionId: string,
): Promise<TransactionSummary> {
  const transaction = await getTransactionByUserAndId(userId, transactionId);
  if (!transaction) {
    throw new Error(`Transaction ${transactionId} not found`);
  }

  const { accountMap, budgetItemMap, recurringTemplateMap } = await getUserData(userId);

  return buildTransactionSummary(transaction, accountMap, budgetItemMap, recurringTemplateMap);
}

export async function summarizeTransactions(
  userId: string,
  filters: Omit<TransactionFilters, "accountId" | "merchantQuery" | "recurringOnly" | "limit"> & {
    groupBy?: TransactionSummaryGroupBy;
  },
): Promise<TransactionSummaryResult> {
  const groupBy = filters.groupBy ?? "budgetItem";
  const { accountMap, budgetItemMap, transactions } = await getUserData(userId);
  const relevantTransactions = filterTransactions(transactions, budgetItemMap, filters);
  const groups = new Map<string, TransactionSummaryRow>();

  const createGroupMetadata = (transaction: typeof relevantTransactions[number]) => {
    if (groupBy === "merchant") {
      return {
        groupKey: transaction.merchant,
        label: transaction.merchant,
      };
    }

    if (groupBy === "account") {
      const account = accountMap.get(transaction.accountId);
      return {
        groupKey: transaction.accountId,
        label: account?.name ?? transaction.accountId,
      };
    }

    if (groupBy === "type") {
      return {
        groupKey: transaction.type,
        label: transaction.type,
      };
    }

    const budgetItem = budgetItemMap.get(transaction.budgetItemId);
    const label = budgetItem
      ? `${budgetItem.category.name} (${budgetItem.budget.month}/${budgetItem.budget.year})`
      : transaction.budgetItemId;

    return {
      groupKey: transaction.budgetItemId,
      label,
    };
  };

  for (const transaction of relevantTransactions) {
    const metadata = createGroupMetadata(transaction);
    const current = groups.get(metadata.groupKey) ?? {
      groupKey: metadata.groupKey,
      label: metadata.label,
      transactionCount: 0,
      debitTotal: 0,
      creditTotal: 0,
      netTotal: 0,
    };

    current.transactionCount += 1;
    current.netTotal += getSignedAmount(transaction);

    if (transaction.type === "debit") {
      current.debitTotal += transaction.amount;
    } else {
      current.creditTotal += transaction.amount;
    }

    groups.set(metadata.groupKey, current);
  }

  const debitTotal = relevantTransactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const creditTotal = relevantTransactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    groupBy,
    transactionCount: relevantTransactions.length,
    debitTotal,
    creditTotal,
    netTotal: creditTotal - debitTotal,
    groups: [...groups.values()].sort((left, right) => right.netTotal - left.netTotal),
  };
}

export async function listRecurringTransactions(
  userId: string,
  filters: { categoryId?: string; recurringDate?: number; limit?: number },
): Promise<RecurringTransactionSummary[]> {
  const { categoryMap, recurringTransactions } = await getUserData(userId);

  return recurringTransactions
    .filter((transaction) =>
      filters.categoryId === undefined ? true : transaction.categoryId === filters.categoryId,
    )
    .filter((transaction) =>
      filters.recurringDate === undefined
        ? true
        : transaction.recurringDate === filters.recurringDate,
    )
    .sort(
      (left, right) =>
        ensureDate(right.updatedAt ?? right.createdAt ?? new Date(0)).getTime() -
        ensureDate(left.updatedAt ?? left.createdAt ?? new Date(0)).getTime(),
    )
    .slice(0, clampLimit(filters.limit))
    .map((transaction) => createRecurringTransactionSummary(transaction, categoryMap)!)
    .filter((transaction): transaction is RecurringTransactionSummary => transaction !== null);
}

export async function getRecurringTransaction(
  userId: string,
  templateId: string,
): Promise<RecurringTransactionDetail> {
  const template = await getRecurringTransactionByUserAndId(userId, templateId);
  if (!template) {
    throw new Error(`Recurring transaction ${templateId} not found`);
  }

  const { categoryMap, transactions } = await getUserData(userId);
  const realizedTransactions = transactions.filter(
    (transaction) => transaction.recurringTemplateId === templateId,
  );
  const latestRealizedTransaction = sortByDate(
    realizedTransactions,
    (transaction) => transaction.date,
  )[0];

  return {
    ...createRecurringTransactionSummary(template, categoryMap)!,
    realizedTransactionCount: realizedTransactions.length,
    latestRealizedTransactionDate: latestRealizedTransaction
      ? toIsoString(latestRealizedTransaction.date)
      : null,
  };
}

export async function summarizeRecurringCommitments(
  userId: string,
): Promise<RecurringCommitmentSummary> {
  const { categoryMap, recurringTransactions } = await getUserData(userId);
  const byCategory = new Map<
    string,
    {
      categoryId: string | null;
      label: string;
      templateCount: number;
      totalAmount: number;
    }
  >();
  const byRecurringDate = new Map<
    number,
    {
      recurringDate: number;
      templateCount: number;
      totalAmount: number;
    }
  >();

  for (const transaction of recurringTransactions) {
    const category = categoryMap.get(transaction.categoryId) ?? null;
    const categoryKey = transaction.categoryId;
    const currentCategory = byCategory.get(categoryKey) ?? {
      categoryId: category?.id ?? null,
      label: category?.name ?? "Unknown category",
      templateCount: 0,
      totalAmount: 0,
    };
    currentCategory.templateCount += 1;
    currentCategory.totalAmount += transaction.amount;
    byCategory.set(categoryKey, currentCategory);

    const currentRecurringDate = byRecurringDate.get(transaction.recurringDate) ?? {
      recurringDate: transaction.recurringDate,
      templateCount: 0,
      totalAmount: 0,
    };
    currentRecurringDate.templateCount += 1;
    currentRecurringDate.totalAmount += transaction.amount;
    byRecurringDate.set(transaction.recurringDate, currentRecurringDate);
  }

  return {
    templateCount: recurringTransactions.length,
    estimatedMonthlyTotal: recurringTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    ),
    byCategory: [...byCategory.values()].sort((left, right) => right.totalAmount - left.totalAmount),
    byRecurringDate: [...byRecurringDate.values()].sort(
      (left, right) => left.recurringDate - right.recurringDate,
    ),
  };
}

export async function validateChatScope(
  userId: string,
  params: {
    budgetId?: string;
    budgetItemId?: string;
    accountId?: string;
    categoryId?: string;
    templateId?: string;
    transactionId?: string;
  },
): Promise<void> {
  const checks: Array<Promise<unknown>> = [];

  if (params.budgetId) {
    checks.push(
      getBudgetByUserAndId(userId, params.budgetId).then((budget) => {
        if (!budget) {
          throw new Error(`Budget ${params.budgetId} not found`);
        }
      }),
    );
  }

  if (params.budgetItemId) {
    checks.push(
      getBudgetItemByUserAndId(userId, params.budgetItemId).then((budgetItem) => {
        if (!budgetItem) {
          throw new Error(`Budget item ${params.budgetItemId} not found`);
        }
      }),
    );
  }

  if (params.accountId) {
    checks.push(
      getAccountByUserAndId(userId, params.accountId).then((account) => {
        if (!account) {
          throw new Error(`Account ${params.accountId} not found`);
        }
      }),
    );
  }

  if (params.categoryId) {
    checks.push(
      getCategoryByUserAndId(userId, params.categoryId).then((category) => {
        if (!category) {
          throw new Error(`Category ${params.categoryId} not found`);
        }
      }),
    );
  }

  if (params.templateId) {
    checks.push(
      getRecurringTransactionByUserAndId(userId, params.templateId).then((template) => {
        if (!template) {
          throw new Error(`Recurring transaction ${params.templateId} not found`);
        }
      }),
    );
  }

  if (params.transactionId) {
    checks.push(
      getTransactionByUserAndId(userId, params.transactionId).then((transaction) => {
        if (!transaction) {
          throw new Error(`Transaction ${params.transactionId} not found`);
        }
      }),
    );
  }

  await Promise.all(checks);
}
