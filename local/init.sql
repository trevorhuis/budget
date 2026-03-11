CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE account_type AS ENUM ('savings', 'checking', 'credit');
CREATE TYPE category_type AS ENUM ('income', 'expense');
CREATE TYPE category_status AS ENUM ('active', 'inactive');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO users (id)
VALUES ('0199a7f8-2000-7000-8000-000000000002')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  type account_type NOT NULL,
  balance numeric(14, 2) NOT NULL,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  type category_type NOT NULL,
  status category_status NOT NULL,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buckets (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  goal numeric(14, 2) NOT NULL,
  current numeric(14, 2) NOT NULL,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  year int NOT NULL,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budgets_user_month_year_unique UNIQUE ("userId", month, year)
);

CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  "allocatedAmount" numeric(14, 2) NOT NULL,
  "actualAmount" numeric(14, 2) NOT NULL,
  "budgetId" uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  "categoryId" uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budget_items_budget_category_unique UNIQUE ("budgetId", "categoryId")
);

CREATE TABLE IF NOT EXISTS transaction_recurring (
  id uuid PRIMARY KEY,
  merchant text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  notes text NOT NULL,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "categoryId" uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY,
  merchant text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  notes text NOT NULL,
  date timestamptz NOT NULL,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "accountId" uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  "budgetId" uuid NOT NULL REFERENCES budgets(id) ON DELETE RESTRICT,
  "categoryId" uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  "recurringTemplateId" uuid NOT NULL REFERENCES transaction_recurring(id) ON DELETE RESTRICT,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
