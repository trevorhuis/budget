import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";
import type { CalculatorType, JsonObject } from "schemas";

export interface Database {
  users: UserTable;
  authAccounts: AuthAccountTable;
  authSessions: AuthSessionTable;
  authVerifications: AuthVerificationTable;
  accounts: AccountTable;
  budgets: BudgetTable;
  categories: CategoryTable;
  budgetItems: BudgetItemTable;
  calculators: CalculatorTable;
  recurringTransaction: RecurringTransactionTable;
  transactions: TransactionTable;
}

export interface UserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: ColumnType<string | null, string | undefined | null, string | null>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface AuthAccountTable {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: ColumnType<string | null, string | undefined | null, string | null>;
  refreshToken: ColumnType<
    string | null,
    string | undefined | null,
    string | null
  >;
  idToken: ColumnType<string | null, string | undefined | null, string | null>;
  accessTokenExpiresAt: ColumnType<
    Date | null,
    string | undefined | null,
    Date | string | null
  >;
  refreshTokenExpiresAt: ColumnType<
    Date | null,
    string | undefined | null,
    Date | string | null
  >;
  scope: ColumnType<string | null, string | undefined | null, string | null>;
  password: ColumnType<string | null, string | undefined | null, string | null>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface AuthSessionTable {
  id: string;
  expiresAt: ColumnType<Date, string | undefined, Date | string>;
  token: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
  ipAddress: ColumnType<string | null, string | undefined | null, string | null>;
  userAgent: ColumnType<string | null, string | undefined | null, string | null>;
  userId: string;
}

export interface AuthVerificationTable {
  id: string;
  identifier: string;
  value: string;
  expiresAt: ColumnType<Date, string | undefined, Date | string>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface AccountTable {
  id: string;
  name: string;
  type: "savings" | "checking" | "creditCard";
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

export interface CategoryTable {
  id: string;
  name: string;
  group: string;
  status: string;
  userId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface BudgetItemTable {
  id: string;
  actualAmount: number;
  targetAmount: number;
  budgetId: string;
  categoryId: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface CalculatorTable {
  id: string;
  userId: string;
  name: string;
  calculatorType: CalculatorType;
  data: ColumnType<JsonObject, JsonObject, JsonObject>;
  shareToken: ColumnType<string | null, string | undefined | null, string | null>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface RecurringTransactionTable {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  userId: string;
  categoryId: string;
  recurringDate: number;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export interface TransactionTable {
  id: string;
  merchant: string;
  amount: number;
  notes: string;
  type: "debit" | "credit";
  date: ColumnType<Date, string | undefined, string>;
  userId: string;
  accountId: string;
  budgetItemId: string;
  recurringTemplateId: ColumnType<
    string | null,
    string | undefined | null,
    string | null
  >;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type AuthAccount = Selectable<AuthAccountTable>;
export type NewAuthAccount = Insertable<AuthAccountTable>;
export type AuthAccountUpdate = Updateable<AuthAccountTable>;

export type AuthSession = Selectable<AuthSessionTable>;
export type NewAuthSession = Insertable<AuthSessionTable>;
export type AuthSessionUpdate = Updateable<AuthSessionTable>;

export type AuthVerification = Selectable<AuthVerificationTable>;
export type NewAuthVerification = Insertable<AuthVerificationTable>;
export type AuthVerificationUpdate = Updateable<AuthVerificationTable>;

export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;

export type Budget = Selectable<BudgetTable>;
export type NewBudget = Insertable<BudgetTable>;
export type BudgetUpdate = Updateable<BudgetTable>;

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;

export type BudgetItem = Selectable<BudgetItemTable>;
export type NewBudgetItem = Insertable<BudgetItemTable>;
export type BudgetItemUpdate = Updateable<BudgetItemTable>;

export type Calculator = Selectable<CalculatorTable>;
export type NewCalculator = Insertable<CalculatorTable>;
export type CalculatorUpdate = Updateable<CalculatorTable>;

export type RecurringTransaction = Selectable<RecurringTransactionTable>;
export type NewRecurringTransaction = Insertable<RecurringTransactionTable>;
export type RecurringTransactionUpdate = Updateable<RecurringTransactionTable>;

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type TransactionUpdate = Updateable<TransactionTable>;
