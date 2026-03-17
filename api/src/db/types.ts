import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  users: UserTable;
  accounts: AccountTable;
  budgets: BudgetTable;
  buckets: BucketTable;
  categories: CategoryTable;
  budgetItems: BudgetItemTable;
  transactionRecurring: TransactionRecurringTable;
  transactions: TransactionTable;
}

export interface UserTable {
  id: string;
  name: string;
}

export interface AccountTable {
  id: string;
  name: string;
  type: "savings" | "checking" | "credit";
  balance: number;
  userId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface BudgetTable {
  id: string;
  month: number;
  year: number;
  userId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface BucketTable {
  id: string;
  name: string;
  goal: number;
  current: number;
  userId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface CategoryTable {
  id: string;
  name: string;
  type: "income" | "expense";
  status: "active" | "inactive";
  userId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface BudgetItemTable {
  id: string;
  name: string;
  allocatedAmount: number;
  actualAmount: number;
  budgetId: string;
  categoryId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface TransactionRecurringTable {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  userId: string;
  categoryId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface TransactionTable {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  date: ColumnType<Date, string | undefined, string>;
  userId: string;
  accountId: string;
  budgetId: string;
  categoryId: string;
  recurringTemplateId: ColumnType<string | null, string | undefined | null, string | null>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;

export type Budget = Selectable<BudgetTable>;
export type NewBudget = Insertable<BudgetTable>;
export type BudgetUpdate = Updateable<BudgetTable>;

export type Bucket = Selectable<BucketTable>;
export type NewBucket = Insertable<BucketTable>;
export type BucketUpdate = Updateable<BucketTable>;

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;

export type BudgetItem = Selectable<BudgetItemTable>;
export type NewBudgetItem = Insertable<BudgetItemTable>;
export type BudgetItemUpdate = Updateable<BudgetItemTable>;

export type TransactionRecurring = Selectable<TransactionRecurringTable>;
export type NewTransactionRecurring = Insertable<TransactionRecurringTable>;
export type TransactionRecurringUpdate = Updateable<TransactionRecurringTable>;

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type TransactionUpdate = Updateable<TransactionTable>;
