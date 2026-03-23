import * as z from "zod";

export const IdSchema = z.uuidv7();

export const DatetimeSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const addIdAndDatetime = <TShape extends z.ZodRawShape>(
  schema: z.ZodObject<TShape>,
) => {
  return z.object({
    id: IdSchema,
    ...schema.shape,
    ...DatetimeSchema.shape,
  });
};

// Accounts
export const AccountBase = z.object({
  name: z.string(),
  type: z.enum(["savings", "checking", "creditCard"]),
  balance: z.number(),
  userId: IdSchema,
});

export const AccountSchema = addIdAndDatetime(AccountBase);
export type Account = z.infer<typeof AccountSchema>;

// Budget
export const BudgetBase = z.object({
  month: z.number(),
  year: z.number(),
  userId: IdSchema,
});

export const BudgetSchema = addIdAndDatetime(BudgetBase);
export type Budget = z.infer<typeof BudgetSchema>;

// Budget Item
export const BudgetItemBase = z.object({
  actualAmount: z.number(),
  targetAmount: z.number(),
  budgetId: IdSchema,
  categoryId: IdSchema,
});

export const BudgetItemSchema = addIdAndDatetime(BudgetItemBase);
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

// Category
export const CategoryBase = z.object({
  name: z.string(),
  group: z.string(),
  status: z.string(),
  userId: IdSchema,
});

export const CategorySchema = addIdAndDatetime(CategoryBase);
export type Category = z.infer<typeof CategorySchema>;

// Transaction
export const TransactionBase = z.object({
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  date: z.coerce.date(),
  userId: IdSchema,
  accountId: IdSchema,
  budgetItemId: IdSchema,
  type: z.enum(["credit", "debit"]),
  recurringTemplateId: IdSchema.optional().nullable(),
});

export const TransactionSchema = addIdAndDatetime(TransactionBase);
export type Transaction = z.infer<typeof TransactionSchema>;

export const BulkTransactionPreviewRowSchema = z.object({
  id: IdSchema,
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  date: z.coerce.date(),
  type: z.enum(["credit", "debit"]),
  accountId: IdSchema.nullable(),
  accountName: z.string().nullable(),
  budgetItemId: IdSchema.nullable(),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
});
export type BulkTransactionPreviewRow = z.infer<
  typeof BulkTransactionPreviewRowSchema
>;

export const BulkTransactionPreviewResponseSchema = z.object({
  previewId: z.string().min(1).nullable(),
  rows: z.array(BulkTransactionPreviewRowSchema),
});
export type BulkTransactionPreviewResponse = z.infer<
  typeof BulkTransactionPreviewResponseSchema
>;

export const BulkTransactionCommitRowSchema = z.object({
  previewRowId: IdSchema,
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  date: z.date(),
  type: z.enum(["credit", "debit"]),
  accountId: IdSchema,
  budgetItemId: IdSchema,
  recurringTemplateId: IdSchema.nullable(),
});
export type BulkTransactionCommitRow = z.infer<
  typeof BulkTransactionCommitRowSchema
>;

export const BulkTransactionCommitRequestSchema = z.object({
  previewId: z.string().min(1).nullable(),
  rows: z.array(BulkTransactionCommitRowSchema).min(1),
});
export type BulkTransactionCommitRequest = z.infer<
  typeof BulkTransactionCommitRequestSchema
>;

// Transaction Recurring
export const RecurringTransactionBase = z.object({
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  recurringDate: z.number(),
  userId: IdSchema,
  categoryId: IdSchema,
});

export const RecurringTransactionSchema = addIdAndDatetime(
  RecurringTransactionBase,
);
export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;

// Calculators
const JsonLiteralSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export type JsonValue =
  | z.infer<typeof JsonLiteralSchema>
  | JsonObject
  | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    JsonLiteralSchema,
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const JsonObjectSchema = z.record(
  z.string(),
  JsonValueSchema,
) as z.ZodType<JsonObject>;

export const CalculatorTypeSchema = z.enum([
  "mortgage",
  "loan",
  "debtPayoff",
]);
export type CalculatorType = z.infer<typeof CalculatorTypeSchema>;

export const CalculatorBase = z.object({
  name: z.string().trim().min(1),
  calculatorType: CalculatorTypeSchema,
  data: JsonObjectSchema,
  shareToken: z.string().trim().min(1).nullable().optional(),
  userId: IdSchema,
});

export const CalculatorSchema = addIdAndDatetime(CalculatorBase);
export type Calculator = z.infer<typeof CalculatorSchema>;
