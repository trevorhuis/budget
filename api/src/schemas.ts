import * as z from "zod/mini";

export const IdSchema = z.uuidv7();

export const DatetimeSchema = z.object({
  createdAt: z.optional(z.date()),
  updatedAt: z.optional(z.date()),
});

const addIdAndDatetime = <TShape extends z.core.$ZodLooseShape>(
  schema: z.ZodMiniObject<TShape>,
) => {
  return z.extend(schema, {
    ...DatetimeSchema.shape,
    id: IdSchema,
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
  recurringTemplateId: z.nullish(IdSchema),
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
  accountId: z.nullable(IdSchema),
  accountName: z.nullable(z.string()),
  budgetItemId: z.nullable(IdSchema),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
});
export type BulkTransactionPreviewRow = z.infer<
  typeof BulkTransactionPreviewRowSchema
>;

export const BulkTransactionPreviewResponseSchema = z.object({
  previewId: z.nullable(z.string().check(z.minLength(1))),
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
  recurringTemplateId: z.nullable(IdSchema),
});
export type BulkTransactionCommitRow = z.infer<
  typeof BulkTransactionCommitRowSchema
>;

export const BulkTransactionCommitRequestSchema = z.object({
  previewId: z.nullable(z.string().check(z.minLength(1))),
  rows: z.array(BulkTransactionCommitRowSchema).check(z.minLength(1)),
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

export const JsonValueSchema: z.ZodMiniType<JsonValue> = z.lazy(() =>
  z.union([
    JsonLiteralSchema,
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const JsonObjectSchema = z.record(
  z.string(),
  JsonValueSchema,
) as z.ZodMiniType<JsonObject>;

export const CalculatorTypeSchema = z.enum(["mortgage", "loan", "debtPayoff"]);
export type CalculatorType = z.infer<typeof CalculatorTypeSchema>;

export const CalculatorBase = z.object({
  name: z.string().check(z.trim(), z.minLength(1)),
  calculatorType: CalculatorTypeSchema,
  data: JsonObjectSchema,
  shareToken: z.optional(
    z.nullable(z.string().check(z.trim(), z.minLength(1))),
  ),
  userId: IdSchema,
});

export const CalculatorSchema = addIdAndDatetime(CalculatorBase);
export type Calculator = z.infer<typeof CalculatorSchema>;
