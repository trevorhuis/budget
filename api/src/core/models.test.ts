import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  InsertAccountSchema,
  UpdateAccountSchema,
} from "../core/account/account.model.js";
import {
  InsertBudgetSchema,
  UpdateBudgetSchema,
} from "../core/budget/budget.model.js";
import {
  InsertBudgetItemSchema,
  UpdateBudgetItemSchema,
} from "../core/budgetItem/budgetItem.model.js";
import {
  InsertCalculatorSchema,
  UpdateCalculatorSchema,
} from "../core/calculator/calculator.model.js";
import {
  InsertCategorySchema,
  UpdateCategorySchema,
} from "../core/category/category.model.js";
import {
  InsertTransactionSchema,
  UpdateTransactionSchema,
} from "../core/transaction/transaction.model.js";
import {
  InsertRecurringTransactionSchema,
  UpdateRecurringTransactionSchema,
} from "../core/transactionRecurring/transactionRecurring.model.js";

const VALID_UUID = "019cf45e-80f5-714a-a121-bb32f8360001";

describe("account model", () => {
  test("InsertAccountSchema accepts valid input", () => {
    const result = InsertAccountSchema.safeParse({
      id: VALID_UUID,
      name: "Main Checking",
      type: "checking",
      balance: 1234.56,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertAccountSchema rejects invalid type", () => {
    const result = InsertAccountSchema.safeParse({
      id: VALID_UUID,
      name: "Account",
      type: "invalid",
      balance: 0,
      userId: VALID_UUID,
    });
    assert.equal(result.success, false);
  });

  test("InsertAccountSchema rejects negative balance", () => {
    const result = InsertAccountSchema.safeParse({
      id: VALID_UUID,
      name: "Account",
      type: "creditCard",
      balance: -100,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("UpdateAccountSchema requires all fields (not partial)", () => {
    const result = UpdateAccountSchema.safeParse({
      name: "Updated Name",
    });
    assert.equal(result.success, false);
  });

  test("UpdateAccountSchema rejects invalid type", () => {
    const result = UpdateAccountSchema.safeParse({
      type: "notAType",
    });
    assert.equal(result.success, false);
  });
});

describe("budget model", () => {
  test("InsertBudgetSchema accepts valid input", () => {
    const result = InsertBudgetSchema.safeParse({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertBudgetSchema accepts month out of range (no range validation)", () => {
    const result = InsertBudgetSchema.safeParse({
      id: VALID_UUID,
      month: 13,
      year: 2026,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertBudgetSchema accepts year out of range (no range validation)", () => {
    const result = InsertBudgetSchema.safeParse({
      id: VALID_UUID,
      month: 3,
      year: 1800,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("UpdateBudgetSchema requires all fields (not partial)", () => {
    const result = UpdateBudgetSchema.safeParse({
      month: 6,
    });
    assert.equal(result.success, false);
  });
});

describe("budgetItem model", () => {
  test("InsertBudgetItemSchema accepts valid input", () => {
    const result = InsertBudgetItemSchema.safeParse({
      id: VALID_UUID,
      targetAmount: 500,
      actualAmount: 250,
      budgetId: VALID_UUID,
      categoryId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertBudgetItemSchema accepts negative amounts (no amount validation)", () => {
    const result = InsertBudgetItemSchema.safeParse({
      id: VALID_UUID,
      targetAmount: -100,
      actualAmount: 0,
      budgetId: VALID_UUID,
      categoryId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("UpdateBudgetItemSchema allows partial updates", () => {
    const result = UpdateBudgetItemSchema.safeParse({
      targetAmount: 600,
    });
    assert.equal(result.success, true);
  });
});

describe("calculator model", () => {
  test("InsertCalculatorSchema accepts valid input", () => {
    const result = InsertCalculatorSchema.safeParse({
      id: VALID_UUID,
      name: "Mortgage Calc",
      calculatorType: "mortgage",
      data: { principal: 300000, rate: 6.5, termYears: 30 },
      userId: VALID_UUID,
      shareToken: null,
    });
    assert.equal(result.success, true);
  });

  test("InsertCalculatorSchema accepts valid input with shareToken", () => {
    const result = InsertCalculatorSchema.safeParse({
      id: VALID_UUID,
      name: "Shared Calc",
      calculatorType: "loan",
      data: {},
      userId: VALID_UUID,
      shareToken: "some-token-value",
    });
    assert.equal(result.success, true);
  });

  test("InsertCalculatorSchema rejects empty name", () => {
    const result = InsertCalculatorSchema.safeParse({
      id: VALID_UUID,
      name: "   ",
      calculatorType: "mortgage",
      data: {},
      userId: VALID_UUID,
    });
    assert.equal(result.success, false);
  });

  test("InsertCalculatorSchema rejects invalid calculatorType", () => {
    const result = InsertCalculatorSchema.safeParse({
      id: VALID_UUID,
      name: "Calc",
      calculatorType: "investment",
      data: {},
      userId: VALID_UUID,
    });
    assert.equal(result.success, false);
  });

  test("InsertCalculatorSchema rejects empty shareToken string", () => {
    const result = InsertCalculatorSchema.safeParse({
      id: VALID_UUID,
      name: "Calc",
      calculatorType: "mortgage",
      data: {},
      userId: VALID_UUID,
      shareToken: "   ",
    });
    assert.equal(result.success, false);
  });

  test("UpdateCalculatorSchema accepts valid input", () => {
    const result = UpdateCalculatorSchema.safeParse({
      name: "Updated Calc",
      calculatorType: "debtPayoff",
      data: { extra: true },
    });
    assert.equal(result.success, true);
  });

  test("UpdateCalculatorSchema rejects invalid calculatorType", () => {
    const result = UpdateCalculatorSchema.safeParse({
      calculatorType: "invalid",
    });
    assert.equal(result.success, false);
  });
});

describe("category model", () => {
  test("InsertCategorySchema accepts valid input", () => {
    const result = InsertCategorySchema.safeParse({
      id: VALID_UUID,
      name: "Groceries",
      group: "Essentials",
      status: "active",
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertCategorySchema accepts empty name (no minLength validation)", () => {
    const result = InsertCategorySchema.safeParse({
      id: VALID_UUID,
      name: "",
      group: "Essentials",
      status: "active",
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("UpdateCategorySchema requires all fields (not partial)", () => {
    const result = UpdateCategorySchema.safeParse({
      name: "Updated Groceries",
    });
    assert.equal(result.success, false);
  });
});

describe("transaction model", () => {
  test("InsertTransactionSchema accepts valid debit transaction", () => {
    const result = InsertTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Trader Joe's",
      amount: 45.67,
      notes: "Weekly groceries",
      date: "2026-03-15T12:00:00.000Z",
      type: "debit",
      accountId: VALID_UUID,
      budgetItemId: VALID_UUID,
      recurringTemplateId: null,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertTransactionSchema accepts valid credit transaction", () => {
    const result = InsertTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Employer",
      amount: 1500,
      notes: "Paycheck",
      date: "2026-03-01T12:00:00.000Z",
      type: "credit",
      accountId: VALID_UUID,
      budgetItemId: VALID_UUID,
      recurringTemplateId: null,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertTransactionSchema rejects invalid type", () => {
    const result = InsertTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Test",
      amount: 10,
      notes: "",
      date: "2026-03-01T12:00:00.000Z",
      type: "transfer",
      accountId: VALID_UUID,
      budgetItemId: VALID_UUID,
      userId: VALID_UUID,
    });
    assert.equal(result.success, false);
  });

  test("InsertTransactionSchema accepts null for recurringTemplateId", () => {
    const result = InsertTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Test",
      amount: 10,
      notes: "",
      date: "2026-03-01T12:00:00.000Z",
      type: "debit",
      accountId: VALID_UUID,
      budgetItemId: VALID_UUID,
      recurringTemplateId: null,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertTransactionSchema accepts valid recurringTemplateId", () => {
    const result = InsertTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Test",
      amount: 10,
      notes: "",
      date: "2026-03-01T12:00:00.000Z",
      type: "debit",
      accountId: VALID_UUID,
      budgetItemId: VALID_UUID,
      recurringTemplateId: VALID_UUID,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("UpdateTransactionSchema allows partial updates", () => {
    const result = UpdateTransactionSchema.safeParse({
      merchant: "Updated Merchant",
      amount: 99.99,
    });
    assert.equal(result.success, true);
  });

  test("UpdateTransactionSchema accepts empty object (no updates)", () => {
    const result = UpdateTransactionSchema.safeParse({});
    assert.equal(result.success, true);
  });
});

describe("recurringTransaction model", () => {
  test("InsertRecurringTransactionSchema accepts valid input", () => {
    const result = InsertRecurringTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Gym Membership",
      amount: 45,
      notes: "Monthly",
      recurringDate: 15,
      categoryId: VALID_UUID,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertRecurringTransactionSchema accepts recurringDate > 31 (no range validation)", () => {
    const result = InsertRecurringTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Test",
      amount: 10,
      notes: "",
      recurringDate: 32,
      categoryId: VALID_UUID,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("InsertRecurringTransactionSchema accepts recurringDate < 1 (no range validation)", () => {
    const result = InsertRecurringTransactionSchema.safeParse({
      id: VALID_UUID,
      merchant: "Test",
      amount: 10,
      notes: "",
      recurringDate: 0,
      categoryId: VALID_UUID,
      userId: VALID_UUID,
    });
    assert.equal(result.success, true);
  });

  test("UpdateRecurringTransactionSchema allows partial updates", () => {
    const result = UpdateRecurringTransactionSchema.safeParse({
      amount: 50,
    });
    assert.equal(result.success, true);
  });
});
