import * as z from "zod";

export const IdSchema = z.uuidv7();

const DatetimeSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const addIdAndDatetime = <TShape extends z.ZodRawShape>(
  schema: z.ZodObject<TShape>
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
  type: z.enum(["savings", "checking", "credit"]),
  balance: z.number(),
  userId: IdSchema,
});

export const AccountSchema = addIdAndDatetime(AccountBase);
export type Account = z.infer<typeof AccountSchema>;

// Buckets
export const BucketBase = z.object({
  name: z.string(),
  goal: z.number(),
  current: z.number(),
  userId: IdSchema,
});

export const BucketSchema = addIdAndDatetime(BucketBase);
export type Bucket = z.infer<typeof BucketSchema>;

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
  name: z.string(),
  actualAmount: z.number(),
  spentAmount: z.number(),
  budgetId: IdSchema,
  categoryId: IdSchema,
});

export const BudgetItemSchema = addIdAndDatetime(BudgetItemBase);
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

// Category
export const CategoryBase = z.object({
  name: z.string(),
  group: z.string(),
  type: z.enum(["income", "expense"]),
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
  budgetId: IdSchema,
  categoryId: IdSchema.nullable().optional(),
  recurringTemplateId: IdSchema.optional().nullable(),
});

export const TransactionSchema = addIdAndDatetime(TransactionBase);
export type Transaction = z.infer<typeof TransactionSchema>;

// Transaction Recurring
export const TransactionRecurringBase = z.object({
  merchant: z.string(),
  amount: z.number(),
  notes: z.string(),
  userId: IdSchema,
  categoryId: IdSchema,
});

export const TransactionRecurringSchema = addIdAndDatetime(
  TransactionRecurringBase
);
export type TransactionRecurring = z.infer<typeof TransactionRecurringSchema>;
