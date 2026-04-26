import assert from "node:assert/strict";
import { before, beforeEach, describe, test } from "node:test";

import { db } from "../db/database.js";
import { resetTestDatabase, setupTestDatabase } from "../test/test.utils.js";
import {
  deleteAccount,
  getAccountById,
  getAccountByUserAndId,
  getAccountsByUser,
  insertAccount,
  updateAccount,
} from "./account/account.repository.js";
import {
  deleteBudget,
  getBudgetById,
  getBudgetByUserAndId,
  getBudgetsByUser,
  insertBudget,
  updateBudget,
} from "./budget/budget.repository.js";
import {
  deleteCategory,
  getCategoryById,
  getCategoryByUserAndId,
  getCategoriesByUser,
  insertCategory,
  updateCategory,
} from "./category/category.repository.js";

let primaryUserId = "";
let secondaryUserId = "";

const VALID_UUID = "019cf45e-80f5-714a-a121-bb32f8360001";

before(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await resetTestDatabase();

  const primaryUser = await db
    .insertInto("users")
    .values({ id: primaryUserId = "019cf45e-80f5-714a-a121-bb32f8360001", name: "Primary", email: "primary@test.com" })
    .returning("id")
    .executeTakeFirstOrThrow();

  const secondaryUser = await db
    .insertInto("users")
    .values({ id: secondaryUserId = "019cf45e-80f5-714a-a121-bb32f8360002", name: "Secondary", email: "secondary@test.com" })
    .returning("id")
    .executeTakeFirstOrThrow();

  primaryUserId = primaryUser.id;
  secondaryUserId = secondaryUser.id;
});

describe("account repository", () => {
  test("getAccountsByUser returns only that user's accounts", async () => {
    await insertAccount({
      id: "019cf45e-80f5-714a-a121-bb32f8360011",
      name: "Primary Account",
      type: "checking",
      balance: 500,
      userId: primaryUserId,
    });
    await insertAccount({
      id: "019cf45e-80f5-714a-a121-bb32f8360012",
      name: "Secondary Account",
      type: "savings",
      balance: 200,
      userId: secondaryUserId,
    });

    const accounts = await getAccountsByUser(primaryUserId);
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].name, "Primary Account");
  });

  test("getAccountByUserAndId returns account when owned by user", async () => {
    await insertAccount({
      id: VALID_UUID,
      name: "My Account",
      type: "checking",
      balance: 100,
      userId: primaryUserId,
    });

    const account = await getAccountByUserAndId(primaryUserId, VALID_UUID);
    assert.ok(account !== null);
    assert.equal(account.name, "My Account");
  });

  test("getAccountByUserAndId returns null when not owned by user", async () => {
    await insertAccount({
      id: VALID_UUID,
      name: "Other Account",
      type: "checking",
      balance: 100,
      userId: secondaryUserId,
    });

    const account = await getAccountByUserAndId(primaryUserId, VALID_UUID);
    assert.equal(account, null);
  });

  test("getAccountById returns account regardless of user", async () => {
    await insertAccount({
      id: VALID_UUID,
      name: "Any Account",
      type: "checking",
      balance: 100,
      userId: secondaryUserId,
    });

    const account = await getAccountById(VALID_UUID);
    assert.ok(account !== null);
    assert.equal(account.name, "Any Account");
  });

  test("getAccountById returns null for non-existent account", async () => {
    const account = await getAccountById("019cf45e-80f5-714a-a121-bb32f8360999");
    assert.equal(account, null);
  });

  test("updateAccount updates account fields", async () => {
    await insertAccount({
      id: VALID_UUID,
      name: "Original",
      type: "checking",
      balance: 100,
      userId: primaryUserId,
    });

    await updateAccount(primaryUserId, VALID_UUID, {
      name: "Updated",
      type: "savings",
      balance: 200,
    });

    const account = await getAccountById(VALID_UUID);
    assert.equal(account?.name, "Updated");
    assert.equal(account?.type, "savings");
    assert.equal(account?.balance, 200);
  });

  test("deleteAccount removes account", async () => {
    await insertAccount({
      id: VALID_UUID,
      name: "To Delete",
      type: "checking",
      balance: 0,
      userId: primaryUserId,
    });

    await deleteAccount(primaryUserId, VALID_UUID);
    const account = await getAccountById(VALID_UUID);
    assert.equal(account, null);
  });

  test("deleteAccount only affects specified user", async () => {
    await insertAccount({
      id: VALID_UUID,
      name: "Secondary Account",
      type: "checking",
      balance: 0,
      userId: secondaryUserId,
    });

    await deleteAccount(primaryUserId, VALID_UUID);
    const account = await getAccountById(VALID_UUID);
    assert.ok(account !== null);
  });
});

describe("budget repository", () => {
  test("getBudgetsByUser returns only that user's budgets", async () => {
    await insertBudget({
      id: "019cf45e-80f5-714a-a121-bb32f8360013",
      month: 1,
      year: 2026,
      userId: primaryUserId,
    });
    await insertBudget({
      id: "019cf45e-80f5-714a-a121-bb32f8360014",
      month: 2,
      year: 2026,
      userId: secondaryUserId,
    });

    const budgets = await getBudgetsByUser(primaryUserId);
    assert.equal(budgets.length, 1);
    assert.equal(budgets[0].month, 1);
  });

  test("getBudgetByUserAndId returns budget when owned by user", async () => {
    await insertBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: primaryUserId,
    });

    const budget = await getBudgetByUserAndId(primaryUserId, VALID_UUID);
    assert.ok(budget !== null);
    assert.equal(budget.month, 3);
  });

  test("getBudgetByUserAndId returns null when not owned by user", async () => {
    await insertBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: secondaryUserId,
    });

    const budget = await getBudgetByUserAndId(primaryUserId, VALID_UUID);
    assert.equal(budget, null);
  });

  test("getBudgetById returns budget regardless of user", async () => {
    await insertBudget({
      id: VALID_UUID,
      month: 4,
      year: 2025,
      userId: secondaryUserId,
    });

    const budget = await getBudgetById(VALID_UUID);
    assert.ok(budget !== null);
    assert.equal(budget.month, 4);
  });

  test("getBudgetById returns null for non-existent budget", async () => {
    const budget = await getBudgetById("019cf45e-80f5-714a-a121-bb32f8360999");
    assert.equal(budget, null);
  });

  test("updateBudget updates budget fields", async () => {
    await insertBudget({
      id: VALID_UUID,
      month: 1,
      year: 2025,
      userId: primaryUserId,
    });

    await updateBudget(primaryUserId, VALID_UUID, {
      month: 12,
      year: 2026,
    });

    const budget = await getBudgetById(VALID_UUID);
    assert.equal(budget?.month, 12);
    assert.equal(budget?.year, 2026);
  });

  test("deleteBudget removes budget", async () => {
    await insertBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: primaryUserId,
    });

    await deleteBudget(primaryUserId, VALID_UUID);
    const budget = await getBudgetById(VALID_UUID);
    assert.equal(budget, null);
  });

  test("deleteBudget only affects specified user", async () => {
    await insertBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: secondaryUserId,
    });

    await deleteBudget(primaryUserId, VALID_UUID);
    const budget = await getBudgetById(VALID_UUID);
    assert.ok(budget !== null);
  });
});

describe("category repository", () => {
  test("getCategoriesByUser returns only that user's categories", async () => {
    await insertCategory({
      id: "019cf45e-80f5-714a-a121-bb32f8360015",
      name: "Groceries",
      group: "Essentials",
      status: "active",
      userId: primaryUserId,
    });
    await insertCategory({
      id: "019cf45e-80f5-714a-a121-bb32f8360016",
      name: "Salary",
      group: "Income",
      status: "active",
      userId: secondaryUserId,
    });

    const categories = await getCategoriesByUser(primaryUserId);
    assert.equal(categories.length, 1);
    assert.equal(categories[0].name, "Groceries");
  });

  test("getCategoryByUserAndId returns category when owned by user", async () => {
    await insertCategory({
      id: VALID_UUID,
      name: "Utilities",
      group: "Bills",
      status: "active",
      userId: primaryUserId,
    });

    const category = await getCategoryByUserAndId(primaryUserId, VALID_UUID);
    assert.ok(category !== null);
    assert.equal(category.name, "Utilities");
  });

  test("getCategoryByUserAndId returns null when not owned by user", async () => {
    await insertCategory({
      id: VALID_UUID,
      name: "Personal",
      group: "Other",
      status: "active",
      userId: secondaryUserId,
    });

    const category = await getCategoryByUserAndId(primaryUserId, VALID_UUID);
    assert.equal(category, null);
  });

  test("getCategoryById returns category regardless of user", async () => {
    await insertCategory({
      id: VALID_UUID,
      name: "Entertainment",
      group: "Lifestyle",
      status: "active",
      userId: secondaryUserId,
    });

    const category = await getCategoryById(VALID_UUID);
    assert.ok(category !== null);
    assert.equal(category.name, "Entertainment");
  });

  test("getCategoryById returns null for non-existent category", async () => {
    const category = await getCategoryById("019cf45e-80f5-714a-a121-bb32f8360999");
    assert.equal(category, null);
  });

  test("updateCategory updates category fields", async () => {
    await insertCategory({
      id: VALID_UUID,
      name: "Old Name",
      group: "Old Group",
      status: "active",
      userId: primaryUserId,
    });

    await updateCategory(primaryUserId, VALID_UUID, {
      name: "New Name",
      group: "New Group",
      status: "inactive",
    });

    const category = await getCategoryById(VALID_UUID);
    assert.equal(category?.name, "New Name");
    assert.equal(category?.group, "New Group");
    assert.equal(category?.status, "inactive");
  });

  test("deleteCategory removes category", async () => {
    await insertCategory({
      id: VALID_UUID,
      name: "To Delete",
      group: "Other",
      status: "active",
      userId: primaryUserId,
    });

    await deleteCategory(primaryUserId, VALID_UUID);
    const category = await getCategoryById(VALID_UUID);
    assert.equal(category, null);
  });

  test("deleteCategory only affects specified user", async () => {
    await insertCategory({
      id: VALID_UUID,
      name: "Secondary Category",
      group: "Other",
      status: "active",
      userId: secondaryUserId,
    });

    await deleteCategory(primaryUserId, VALID_UUID);
    const category = await getCategoryById(VALID_UUID);
    assert.ok(category !== null);
  });
});
