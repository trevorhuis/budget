import { toolDefinition, type Tool } from "@tanstack/ai";
import { z } from "zod";

import {
  analyzeBudgetItemSpend,
  getBudget,
  getBudgetItem,
  getRecurringTransaction,
  getTransaction,
  listBudgetItems,
  listBudgets,
  listRecurringTransactions,
  listTransactions,
  summarizeRecurringCommitments,
  summarizeTransactions,
  type BudgetDetail,
  type BudgetItemDetail,
  type BudgetItemSpendAnalysis,
  type BudgetItemSummary,
  type BudgetSummary,
  type RecurringCommitmentSummary,
  type RecurringTransactionDetail,
  type RecurringTransactionSummary,
  type TransactionSummary,
  type TransactionSummaryResult,
  validateChatScope,
} from "./chat.queries.js";

const LimitSchema = z.number().int().min(1).max(100).optional();
const IdSchema = z.uuid();
const OptionalDateFilterSchema = z.string().optional().describe(
  "ISO date or datetime string. Date-only values are interpreted in UTC.",
);

const CategorySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.string(),
  status: z.string(),
});

const BudgetSummarySchema = z.object({
  id: z.string(),
  month: z.number(),
  year: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const BudgetItemBudgetSummarySchema = z.object({
  id: z.string(),
  month: z.number(),
  year: z.number(),
});

const BudgetItemSummarySchema = z.object({
  id: z.string(),
  actualAmount: z.number(),
  targetAmount: z.number(),
  variance: z.number(),
  budget: BudgetItemBudgetSummarySchema,
  category: CategorySummarySchema,
  transactionCount: z.number(),
  latestTransactionDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const RecurringTransactionSummarySchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  recurringDate: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: CategorySummarySchema.nullable(),
});

const TransactionSummarySchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  type: z.enum(["debit", "credit"]),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  account: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["savings", "checking", "creditCard"]),
      balance: z.number(),
    })
    .nullable(),
  budgetItem: BudgetItemSummarySchema.extend({
    budgetId: z.string(),
    categoryId: z.string(),
  }).nullable(),
  budget: BudgetItemBudgetSummarySchema.nullable(),
  recurringTemplate: z
    .object({
      id: z.string(),
      merchant: z.string(),
      amount: z.number(),
      notes: z.string(),
      recurringDate: z.number(),
      category: CategorySummarySchema.nullable(),
    })
    .nullable(),
});

const TransactionSummaryGroupSchema = z.object({
  groupKey: z.string(),
  label: z.string(),
  transactionCount: z.number(),
  debitTotal: z.number(),
  creditTotal: z.number(),
  netTotal: z.number(),
});

const BudgetDetailSchema = BudgetSummarySchema.extend({
  itemCount: z.number(),
  targetTotal: z.number(),
  actualTotal: z.number(),
  varianceTotal: z.number(),
  budgetItems: z.array(BudgetItemSummarySchema),
});

const BudgetItemDetailSchema = BudgetItemSummarySchema.extend({
  budgetId: z.string(),
  categoryId: z.string(),
  recentTransactions: z.array(TransactionSummarySchema),
});

const BudgetItemSpendAnalysisSchema = z.object({
  budgetItemId: z.string(),
  targetAmount: z.number(),
  actualAmount: z.number(),
  variance: z.number(),
  percentUsed: z.number(),
  transactionCount: z.number(),
  creditTotal: z.number(),
  debitTotal: z.number(),
  topMerchants: z.array(
    z.object({
      merchant: z.string(),
      netAmount: z.number(),
      absoluteNetAmount: z.number(),
      debitTotal: z.number(),
      creditTotal: z.number(),
      transactionCount: z.number(),
    }),
  ),
});

const TransactionSummaryResultSchema = z.object({
  groupBy: z.enum(["merchant", "budgetItem", "account", "type"]),
  transactionCount: z.number(),
  debitTotal: z.number(),
  creditTotal: z.number(),
  netTotal: z.number(),
  groups: z.array(TransactionSummaryGroupSchema),
});

const RecurringTransactionDetailSchema = RecurringTransactionSummarySchema.extend({
  realizedTransactionCount: z.number(),
  latestRealizedTransactionDate: z.string().nullable(),
});

const RecurringCommitmentSummarySchema = z.object({
  templateCount: z.number(),
  estimatedMonthlyTotal: z.number(),
  byCategory: z.array(
    z.object({
      categoryId: z.string().nullable(),
      label: z.string(),
      templateCount: z.number(),
      totalAmount: z.number(),
    }),
  ),
  byRecurringDate: z.array(
    z.object({
      recurringDate: z.number(),
      templateCount: z.number(),
      totalAmount: z.number(),
    }),
  ),
});

const ListBudgetsInputSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  limit: LimitSchema,
});

const GetBudgetInputSchema = z.object({
  budgetId: IdSchema,
});

const ListBudgetItemsInputSchema = z.object({
  budgetId: IdSchema.optional(),
  categoryId: IdSchema.optional(),
  limit: LimitSchema,
});

const GetBudgetItemInputSchema = z.object({
  budgetItemId: IdSchema,
});

const AnalyzeBudgetItemInputSchema = z.object({
  budgetItemId: IdSchema,
});

const ListTransactionsInputSchema = z.object({
  budgetItemId: IdSchema.optional(),
  accountId: IdSchema.optional(),
  type: z.enum(["debit", "credit"]).optional(),
  startDate: OptionalDateFilterSchema,
  endDate: OptionalDateFilterSchema,
  merchantQuery: z.string().optional(),
  recurringOnly: z.boolean().optional(),
  limit: LimitSchema,
});

const GetTransactionInputSchema = z.object({
  transactionId: IdSchema,
});

const SummarizeTransactionsInputSchema = z.object({
  budgetId: IdSchema.optional(),
  budgetItemId: IdSchema.optional(),
  startDate: OptionalDateFilterSchema,
  endDate: OptionalDateFilterSchema,
  groupBy: z.enum(["merchant", "budgetItem", "account", "type"]).optional(),
});

const ListRecurringTransactionsInputSchema = z.object({
  categoryId: IdSchema.optional(),
  recurringDate: z.number().int().min(1).max(31).optional(),
  limit: LimitSchema,
});

const GetRecurringTransactionInputSchema = z.object({
  templateId: IdSchema,
});

const SummarizeRecurringCommitmentsInputSchema = z.object({});

type BudgetChatTool =
  | Tool<typeof ListBudgetsInputSchema, z.ZodArray<typeof BudgetSummarySchema>, "list_budgets">
  | Tool<typeof GetBudgetInputSchema, typeof BudgetDetailSchema, "get_budget">
  | Tool<
      typeof ListBudgetItemsInputSchema,
      z.ZodArray<typeof BudgetItemSummarySchema>,
      "list_budget_items"
    >
  | Tool<typeof GetBudgetItemInputSchema, typeof BudgetItemDetailSchema, "get_budget_item">
  | Tool<
      typeof AnalyzeBudgetItemInputSchema,
      typeof BudgetItemSpendAnalysisSchema,
      "analyze_budget_item_spend"
    >
  | Tool<
      typeof ListTransactionsInputSchema,
      z.ZodArray<typeof TransactionSummarySchema>,
      "list_transactions"
    >
  | Tool<typeof GetTransactionInputSchema, typeof TransactionSummarySchema, "get_transaction">
  | Tool<
      typeof SummarizeTransactionsInputSchema,
      typeof TransactionSummaryResultSchema,
      "summarize_transactions"
    >
  | Tool<
      typeof ListRecurringTransactionsInputSchema,
      z.ZodArray<typeof RecurringTransactionSummarySchema>,
      "list_recurring_transactions"
    >
  | Tool<
      typeof GetRecurringTransactionInputSchema,
      typeof RecurringTransactionDetailSchema,
      "get_recurring_transaction"
    >
  | Tool<
      typeof SummarizeRecurringCommitmentsInputSchema,
      typeof RecurringCommitmentSummarySchema,
      "summarize_recurring_commitments"
    >;

const createReadOnlyTool = <TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny, TName extends string>(
  definition: {
    name: TName;
    description: string;
    inputSchema: TInput;
    outputSchema: TOutput;
    execute: (args: any) => Promise<any>;
  },
) => {
  return toolDefinition({
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema,
    outputSchema: definition.outputSchema,
  }).server(definition.execute);
};

export function buildBudgetChatTools(userId: string): BudgetChatTool[] {
  const listBudgetsTool = createReadOnlyTool({
    name: "list_budgets",
    description:
      "List the current user's budgets. Use this to find available budget periods or narrow by month/year.",
    inputSchema: ListBudgetsInputSchema,
    outputSchema: z.array(BudgetSummarySchema),
    execute: async (args): Promise<BudgetSummary[]> => {
      return await listBudgets(userId, args);
    },
  });

  const getBudgetTool = createReadOnlyTool({
    name: "get_budget",
    description:
      "Get a single budget with computed totals and denormalized budget items for the current user.",
    inputSchema: GetBudgetInputSchema,
    outputSchema: BudgetDetailSchema,
    execute: async (args): Promise<BudgetDetail> => {
      await validateChatScope(userId, { budgetId: args.budgetId });
      return await getBudget(userId, args.budgetId);
    },
  });

  const listBudgetItemsTool = createReadOnlyTool({
    name: "list_budget_items",
    description:
      "List budget items for the current user with budget and category info, transaction counts, and latest transaction dates.",
    inputSchema: ListBudgetItemsInputSchema,
    outputSchema: z.array(BudgetItemSummarySchema),
    execute: async (args): Promise<BudgetItemSummary[]> => {
      await validateChatScope(userId, {
        budgetId: args.budgetId,
        categoryId: args.categoryId,
      });
      return await listBudgetItems(userId, args);
    },
  });

  const getBudgetItemTool = createReadOnlyTool({
    name: "get_budget_item",
    description:
      "Get one budget item for the current user, including linked budget/category data and recent transactions.",
    inputSchema: GetBudgetItemInputSchema,
    outputSchema: BudgetItemDetailSchema,
    execute: async (args): Promise<BudgetItemDetail> => {
      await validateChatScope(userId, { budgetItemId: args.budgetItemId });
      return await getBudgetItem(userId, args.budgetItemId);
    },
  });

  const analyzeBudgetItemSpendTool = createReadOnlyTool({
    name: "analyze_budget_item_spend",
    description:
      "Analyze one budget item's spending using current-user transactions, including percent used and top merchants.",
    inputSchema: AnalyzeBudgetItemInputSchema,
    outputSchema: BudgetItemSpendAnalysisSchema,
    execute: async (args): Promise<BudgetItemSpendAnalysis> => {
      await validateChatScope(userId, { budgetItemId: args.budgetItemId });
      return await analyzeBudgetItemSpend(userId, args.budgetItemId);
    },
  });

  const listTransactionsTool = createReadOnlyTool({
    name: "list_transactions",
    description:
      "List current-user transactions with denormalized account, budget item, budget, and recurring template summaries. Supports budget item, account, type, date, merchant, and recurring filters.",
    inputSchema: ListTransactionsInputSchema,
    outputSchema: z.array(TransactionSummarySchema),
    execute: async (args): Promise<TransactionSummary[]> => {
      await validateChatScope(userId, {
        budgetItemId: args.budgetItemId,
        accountId: args.accountId,
      });
      return await listTransactions(userId, args);
    },
  });

  const getTransactionTool = createReadOnlyTool({
    name: "get_transaction",
    description:
      "Get one current-user transaction with denormalized account, budget item, budget, and recurring template summaries.",
    inputSchema: GetTransactionInputSchema,
    outputSchema: TransactionSummarySchema,
    execute: async (args): Promise<TransactionSummary> => {
      await validateChatScope(userId, { transactionId: args.transactionId });
      return await getTransaction(userId, args.transactionId);
    },
  });

  const summarizeTransactionsTool = createReadOnlyTool({
    name: "summarize_transactions",
    description:
      "Summarize current-user transactions with debit, credit, and net totals grouped by merchant, budget item, account, or type.",
    inputSchema: SummarizeTransactionsInputSchema,
    outputSchema: TransactionSummaryResultSchema,
    execute: async (args): Promise<TransactionSummaryResult> => {
      await validateChatScope(userId, {
        budgetId: args.budgetId,
        budgetItemId: args.budgetItemId,
      });
      return await summarizeTransactions(userId, args);
    },
  });

  const listRecurringTransactionsTool = createReadOnlyTool({
    name: "list_recurring_transactions",
    description:
      "List current-user recurring transaction templates with denormalized category info and optional category/date filters.",
    inputSchema: ListRecurringTransactionsInputSchema,
    outputSchema: z.array(RecurringTransactionSummarySchema),
    execute: async (args): Promise<RecurringTransactionSummary[]> => {
      await validateChatScope(userId, { categoryId: args.categoryId });
      return await listRecurringTransactions(userId, args);
    },
  });

  const getRecurringTransactionTool = createReadOnlyTool({
    name: "get_recurring_transaction",
    description:
      "Get one recurring transaction template for the current user, including realized transaction counts and latest realized transaction date.",
    inputSchema: GetRecurringTransactionInputSchema,
    outputSchema: RecurringTransactionDetailSchema,
    execute: async (args): Promise<RecurringTransactionDetail> => {
      await validateChatScope(userId, { templateId: args.templateId });
      return await getRecurringTransaction(userId, args.templateId);
    },
  });

  const summarizeRecurringCommitmentsTool = createReadOnlyTool({
    name: "summarize_recurring_commitments",
    description:
      "Summarize current-user recurring transaction templates by category and recurring date, including estimated monthly totals.",
    inputSchema: SummarizeRecurringCommitmentsInputSchema,
    outputSchema: RecurringCommitmentSummarySchema,
    execute: async (): Promise<RecurringCommitmentSummary> => {
      return await summarizeRecurringCommitments(userId);
    },
  });

  return [
    listBudgetsTool,
    getBudgetTool,
    listBudgetItemsTool,
    getBudgetItemTool,
    analyzeBudgetItemSpendTool,
    listTransactionsTool,
    getTransactionTool,
    summarizeTransactionsTool,
    listRecurringTransactionsTool,
    getRecurringTransactionTool,
    summarizeRecurringCommitmentsTool,
  ];
}
