import type {
  NewAccount,
  NewBudget,
  NewBudgetItem,
  NewBucket,
  NewCategory,
  NewTransaction,
  NewTransactionRecurring,
  NewUser,
} from "./types.js";
import { closeDb, db } from "./database.js";
import { runMigrations } from "./migrate.js";

const users: NewUser[] = [
  {
    id: "019cf45e-80f5-714a-a121-bb32f8364813",
    name: "Trevor Demo",
  },
  {
    id: "0195a9f0-b001-71aa-8c01-a1d2e3f40002",
    name: "Jordan Example",
  },
];

const categories: NewCategory[] = [
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40101",
    name: "Paycheck",
    group: "Income",
    type: "income",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40102",
    name: "Freelance",
    group: "Income",
    type: "income",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40103",
    name: "Housing",
    group: "Bills",
    type: "expense",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40104",
    name: "Groceries",
    group: "Food",
    type: "expense",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40105",
    name: "Dining Out",
    group: "Food",
    type: "expense",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40106",
    name: "Transportation",
    group: "Transport",
    type: "expense",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40107",
    name: "Utilities",
    group: "Bills",
    type: "expense",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40108",
    name: "Fun Money",
    group: "Lifestyle",
    type: "expense",
    userId: users[0].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40109",
    name: "Salary",
    group: "Income",
    type: "income",
    userId: users[1].id,
  },
  {
    id: "0195a9f0-c101-71aa-8c01-a1d2e3f40110",
    name: "Travel",
    group: "Travel",
    type: "expense",
    userId: users[1].id,
  },
];

const accounts: NewAccount[] = [
  {
    id: "0195a9f0-a201-71aa-8c01-a1d2e3f40201",
    name: "Main Checking",
    type: "checking",
    balance: 4825.72,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-a201-71aa-8c01-a1d2e3f40202",
    name: "Emergency Savings",
    type: "savings",
    balance: 12600,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-a201-71aa-8c01-a1d2e3f40203",
    name: "Rewards Credit Card",
    type: "credit",
    balance: -438.12,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-a201-71aa-8c01-a1d2e3f40204",
    name: "Jordan Checking",
    type: "checking",
    balance: 3100.45,
    userId: users[1].id,
  },
];

const budgets: NewBudget[] = [
  {
    id: "0195a9f0-b301-71aa-8c01-a1d2e3f40301",
    month: 3,
    year: 2026,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-b301-71aa-8c01-a1d2e3f40302",
    month: 4,
    year: 2026,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-b301-71aa-8c01-a1d2e3f40303",
    month: 3,
    year: 2026,
    userId: users[1].id,
  },
];

const buckets: NewBucket[] = [
  {
    id: "0195a9f0-b401-71aa-8c01-a1d2e3f40401",
    name: "Emergency Fund",
    goal: 15000,
    current: 12600,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-b401-71aa-8c01-a1d2e3f40402",
    name: "Summer Trip",
    goal: 2800,
    current: 940,
    userId: users[0].id,
  },
  {
    id: "0195a9f0-b401-71aa-8c01-a1d2e3f40403",
    name: "New Laptop",
    goal: 2200,
    current: 500,
    userId: users[1].id,
  },
];

const budgetItems: NewBudgetItem[] = [
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40501",
    name: "Rent",
    spentAmount: 1800,
    actualAmount: 1800,
    budgetId: budgets[0].id,
    categoryId: categories[2].id,
  },
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40502",
    name: "Groceries",
    spentAmount: 650,
    actualAmount: 488.34,
    budgetId: budgets[0].id,
    categoryId: categories[3].id,
  },
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40503",
    name: "Restaurants",
    spentAmount: 220,
    actualAmount: 141.88,
    budgetId: budgets[0].id,
    categoryId: categories[4].id,
  },
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40504",
    name: "Gas and Transit",
    spentAmount: 180,
    actualAmount: 92.17,
    budgetId: budgets[0].id,
    categoryId: categories[5].id,
  },
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40505",
    name: "Electric and Internet",
    spentAmount: 240,
    actualAmount: 210.44,
    budgetId: budgets[0].id,
    categoryId: categories[6].id,
  },
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40506",
    name: "Next Month Groceries",
    spentAmount: 700,
    actualAmount: 0,
    budgetId: budgets[1].id,
    categoryId: categories[3].id,
  },
  {
    id: "0195a9f0-b501-71aa-8c01-a1d2e3f40507",
    name: "Jordan Travel",
    spentAmount: 900,
    actualAmount: 240,
    budgetId: budgets[2].id,
    categoryId: categories[9].id,
  },
];

const recurringTransactions: NewTransactionRecurring[] = [
  {
    id: "0195a9f0-d601-71aa-8c01-a1d2e3f40601",
    merchant: "Apartment Management Co",
    amount: 1800,
    notes: "Monthly rent autopay",
    userId: users[0].id,
    categoryId: categories[2].id,
  },
  {
    id: "0195a9f0-d601-71aa-8c01-a1d2e3f40602",
    merchant: "City Power",
    amount: 95,
    notes: "Average electric bill",
    userId: users[0].id,
    categoryId: categories[6].id,
  },
  {
    id: "0195a9f0-d601-71aa-8c01-a1d2e3f40603",
    merchant: "Employer Payroll",
    amount: 3250,
    notes: "Bi-weekly paycheck template",
    userId: users[1].id,
    categoryId: categories[8].id,
  },
];

const transactions: NewTransaction[] = [
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40701",
    merchant: "Employer Payroll",
    amount: 2800,
    notes: "Primary paycheck",
    date: "2026-03-01T14:00:00.000Z",
    userId: users[0].id,
    accountId: accounts[0].id,
    budgetId: budgets[0].id,
    categoryId: categories[0].id,
    recurringTemplateId: null,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40702",
    merchant: "Freelance Client",
    amount: 640,
    notes: "Landing page invoice",
    date: "2026-03-04T18:30:00.000Z",
    userId: users[0].id,
    accountId: accounts[0].id,
    budgetId: budgets[0].id,
    categoryId: categories[1].id,
    recurringTemplateId: null,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40703",
    merchant: "Apartment Management Co",
    amount: -1800,
    notes: "March rent",
    date: "2026-03-02T15:00:00.000Z",
    userId: users[0].id,
    accountId: accounts[0].id,
    budgetId: budgets[0].id,
    categoryId: categories[2].id,
    recurringTemplateId: recurringTransactions[0].id,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40704",
    merchant: "Fresh Market",
    amount: -128.44,
    notes: "Weekly groceries",
    date: "2026-03-06T23:15:00.000Z",
    userId: users[0].id,
    accountId: accounts[0].id,
    budgetId: budgets[0].id,
    categoryId: categories[3].id,
    recurringTemplateId: null,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40705",
    merchant: "Neighborhood Cafe",
    amount: -24.18,
    notes: "Lunch meeting",
    date: "2026-03-07T19:10:00.000Z",
    userId: users[0].id,
    accountId: accounts[2].id,
    budgetId: budgets[0].id,
    categoryId: categories[4].id,
    recurringTemplateId: null,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40706",
    merchant: "City Power",
    amount: -92.31,
    notes: "Electric bill",
    date: "2026-03-08T13:00:00.000Z",
    userId: users[0].id,
    accountId: accounts[0].id,
    budgetId: budgets[0].id,
    categoryId: categories[6].id,
    recurringTemplateId: recurringTransactions[1].id,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40707",
    merchant: "Metro Transit",
    amount: -32.17,
    notes: "Train reload",
    date: "2026-03-10T12:45:00.000Z",
    userId: users[0].id,
    accountId: accounts[0].id,
    budgetId: budgets[0].id,
    categoryId: categories[5].id,
    recurringTemplateId: null,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40708",
    merchant: "Employer Payroll",
    amount: 3250,
    notes: "March paycheck",
    date: "2026-03-01T15:00:00.000Z",
    userId: users[1].id,
    accountId: accounts[3].id,
    budgetId: budgets[2].id,
    categoryId: categories[8].id,
    recurringTemplateId: recurringTransactions[2].id,
  },
  {
    id: "0195a9f0-e701-71aa-8c01-a1d2e3f40709",
    merchant: "Airline",
    amount: -240,
    notes: "Flight deposit",
    date: "2026-03-12T20:00:00.000Z",
    userId: users[1].id,
    accountId: accounts[3].id,
    budgetId: budgets[2].id,
    categoryId: categories[9].id,
    recurringTemplateId: null,
  },
];

const resetTables = async () => {
  await db.deleteFrom("transactions").execute();
  await db.deleteFrom("transactionRecurring").execute();
  await db.deleteFrom("budgetItems").execute();
  await db.deleteFrom("buckets").execute();
  await db.deleteFrom("budgets").execute();
  await db.deleteFrom("accounts").execute();
  await db.deleteFrom("categories").execute();
  await db.deleteFrom("users").execute();
};

const seed = async () => {
  try {
    await runMigrations();
    await resetTables();

    await db.insertInto("users").values(users).execute();
    await db.insertInto("categories").values(categories).execute();
    await db.insertInto("accounts").values(accounts).execute();
    await db.insertInto("budgets").values(budgets).execute();
    await db.insertInto("buckets").values(buckets).execute();
    await db.insertInto("budgetItems").values(budgetItems).execute();
    await db
      .insertInto("transactionRecurring")
      .values(recurringTransactions)
      .execute();
    await db.insertInto("transactions").values(transactions).execute();

    console.log("Seed completed successfully.");
  } finally {
    await closeDb();
  }
};

void seed();
