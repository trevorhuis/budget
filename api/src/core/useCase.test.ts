import assert from "node:assert/strict";
import { before, beforeEach, describe, test } from "node:test";

import {
  createAccount,
  readAccountsFromUser,
  accountUpdate,
  removeAccount,
} from "./account/account.useCase.js";
import {
  createBudget,
  readBudgetsFromUser,
  budgetUpdate,
  removeBudget,
} from "./budget/budget.useCase.js";
import { db } from "../db/database.js";
import {
  createBulkTransactionPreview,
  commitBulkTransactions,
  BulkPreviewTooLargeError,
  BulkPreviewValidationError,
} from "./transaction/transactionBulk.useCase.js";
import { setBulkTransactionPreviewExecutorForTests } from "./transaction/transactionBulk.openai.js";
import { AccessDeniedException, NotFoundException } from "../errors.js";
import { resetTestDatabase, setupTestDatabase } from "../test/test.utils.js";

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

describe("account useCase", () => {
  test("createAccount inserts and returns true", async () => {
    const result = await createAccount({
      id: VALID_UUID,
      name: "Main Checking",
      type: "checking",
      balance: 1000,
      userId: primaryUserId,
    });
    assert.equal(result, true);

    const accounts = await db.selectFrom("accounts").selectAll().where("userId", "=", primaryUserId).execute();
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].name, "Main Checking");
  });

  test("readAccountsFromUser returns only that user's accounts", async () => {
    await createAccount({
      id: "019cf45e-80f5-714a-a121-bb32f8360011",
      name: "Primary Account",
      type: "checking",
      balance: 500,
      userId: primaryUserId,
    });
    await createAccount({
      id: "019cf45e-80f5-714a-a121-bb32f8360012",
      name: "Secondary Account",
      type: "savings",
      balance: 200,
      userId: secondaryUserId,
    });

    const primaryAccounts = await readAccountsFromUser(primaryUserId);
    const secondaryAccounts = await readAccountsFromUser(secondaryUserId);

    assert.equal(primaryAccounts.length, 1);
    assert.equal(primaryAccounts[0].name, "Primary Account");
    assert.equal(secondaryAccounts.length, 1);
    assert.equal(secondaryAccounts[0].name, "Secondary Account");
  });

  test("accountUpdate updates account and returns true", async () => {
    await createAccount({
      id: VALID_UUID,
      name: "Old Name",
      type: "checking",
      balance: 100,
      userId: primaryUserId,
    });

    const result = await accountUpdate(primaryUserId, VALID_UUID, {
      name: "New Name",
      type: "savings",
      balance: 200,
    });
    assert.equal(result, true);

    const account = await db.selectFrom("accounts").selectAll().where("id", "=", VALID_UUID).executeTakeFirstOrThrow();
    assert.equal(account.name, "New Name");
    assert.equal(account.type, "savings");
    assert.equal(account.balance, 200);
  });

  test("accountUpdate throws NotFoundException for non-existent id", async () => {
    await assert.rejects(
      async () => accountUpdate(primaryUserId, "019cf45e-80f5-714a-a121-bb32f8360999", {}),
      (err: any) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });

  test("accountUpdate throws AccessDeniedException when updating another user's account", async () => {
    await createAccount({
      id: VALID_UUID,
      name: "Secondary Account",
      type: "checking",
      balance: 100,
      userId: secondaryUserId,
    });

    await assert.rejects(
      async () => accountUpdate(primaryUserId, VALID_UUID, { name: "Hijacked" }),
      (err: any) => {
        assert.ok(err instanceof AccessDeniedException);
        return true;
      },
    );
  });

  test("removeAccount deletes account and returns true", async () => {
    await createAccount({
      id: VALID_UUID,
      name: "To Delete",
      type: "checking",
      balance: 0,
      userId: primaryUserId,
    });

    const result = await removeAccount(primaryUserId, VALID_UUID);
    assert.equal(result, true);

    const accounts = await db.selectFrom("accounts").selectAll().where("id", "=", VALID_UUID).execute();
    assert.equal(accounts.length, 0);
  });

  test("removeAccount throws NotFoundException for non-existent id", async () => {
    await assert.rejects(
      async () => removeAccount(primaryUserId, "019cf45e-80f5-714a-a121-bb32f8360999"),
      (err: any) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });

  test("removeAccount throws AccessDeniedException when deleting another user's account", async () => {
    await createAccount({
      id: VALID_UUID,
      name: "Secondary Account",
      type: "checking",
      balance: 0,
      userId: secondaryUserId,
    });

    await assert.rejects(
      async () => removeAccount(primaryUserId, VALID_UUID),
      (err: any) => {
        assert.ok(err instanceof AccessDeniedException);
        return true;
      },
    );
  });
});

describe("budget useCase", () => {
  test("createBudget inserts and returns true", async () => {
    const result = await createBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: primaryUserId,
    });
    assert.equal(result, true);

    const budgets = await db.selectFrom("budgets").selectAll().where("userId", "=", primaryUserId).execute();
    assert.equal(budgets.length, 1);
    assert.equal(budgets[0].month, 3);
    assert.equal(budgets[0].year, 2026);
  });

  test("readBudgetsFromUser returns only that user's budgets", async () => {
    await createBudget({
      id: "019cf45e-80f5-714a-a121-bb32f8360013",
      month: 1,
      year: 2026,
      userId: primaryUserId,
    });
    await createBudget({
      id: "019cf45e-80f5-714a-a121-bb32f8360014",
      month: 2,
      year: 2026,
      userId: secondaryUserId,
    });

    const primaryBudgets = await readBudgetsFromUser(primaryUserId);
    const secondaryBudgets = await readBudgetsFromUser(secondaryUserId);

    assert.equal(primaryBudgets.length, 1);
    assert.equal(secondaryBudgets.length, 1);
  });

  test("budgetUpdate updates budget and returns true", async () => {
    await createBudget({
      id: VALID_UUID,
      month: 1,
      year: 2025,
      userId: primaryUserId,
    });

    const result = await budgetUpdate(primaryUserId, VALID_UUID, {
      month: 12,
      year: 2026,
    });
    assert.equal(result, true);

    const budget = await db.selectFrom("budgets").selectAll().where("id", "=", VALID_UUID).executeTakeFirstOrThrow();
    assert.equal(budget.month, 12);
    assert.equal(budget.year, 2026);
  });

  test("budgetUpdate throws NotFoundException for non-existent id", async () => {
    await assert.rejects(
      async () => budgetUpdate(primaryUserId, "019cf45e-80f5-714a-a121-bb32f8360999", { month: 1 }),
      (err: any) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });

  test("budgetUpdate throws AccessDeniedException when updating another user's budget", async () => {
    await createBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: secondaryUserId,
    });

    await assert.rejects(
      async () => budgetUpdate(primaryUserId, VALID_UUID, { month: 6 }),
      (err: any) => {
        assert.ok(err instanceof AccessDeniedException);
        return true;
      },
    );
  });

  test("removeBudget deletes budget and returns true", async () => {
    await createBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: primaryUserId,
    });

    const result = await removeBudget(primaryUserId, VALID_UUID);
    assert.equal(result, true);

    const budgets = await db.selectFrom("budgets").selectAll().where("id", "=", VALID_UUID).execute();
    assert.equal(budgets.length, 0);
  });

  test("removeBudget throws NotFoundException for non-existent id", async () => {
    await assert.rejects(
      async () => removeBudget(primaryUserId, "019cf45e-80f5-714a-a121-bb32f8360999"),
      (err: any) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });

  test("removeBudget throws AccessDeniedException when deleting another user's budget", async () => {
    await createBudget({
      id: VALID_UUID,
      month: 3,
      year: 2026,
      userId: secondaryUserId,
    });

    await assert.rejects(
      async () => removeBudget(primaryUserId, VALID_UUID),
      (err: any) => {
        assert.ok(err instanceof AccessDeniedException);
        return true;
      },
    );
  });
});

describe("transactionBulk useCase", () => {
  test("createBulkTransactionPreview throws for empty file", async () => {
    const emptyFile = new File([], "empty.csv", { type: "text/csv" });

    await assert.rejects(
      async () => createBulkTransactionPreview(primaryUserId, emptyFile),
      (err: any) => {
        assert.ok(err instanceof BulkPreviewValidationError);
        return true;
      },
    );
  });

  test("createBulkTransactionPreview throws for file exceeding row limit", async () => {
    const csvLines = ["Date,Description,Amount"];
    for (let i = 0; i < 501; i++) {
      csvLines.push(`2026-03-10,Row ${i},-1.00`);
    }
    const largeFile = new File([csvLines.join("\n")], "large.csv", { type: "text/csv" });

    await assert.rejects(
      async () => createBulkTransactionPreview(primaryUserId, largeFile),
      (err: any) => {
        assert.ok(err instanceof BulkPreviewTooLargeError);
        return true;
      },
    );
  });

  test("createBulkTransactionPreview parses valid CSV and returns preview rows", async () => {
    await db.insertInto("accounts").values({
      id: VALID_UUID,
      name: "Main Checking",
      type: "checking",
      balance: 1000,
      userId: primaryUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).executeTakeFirstOrThrow();

    setBulkTransactionPreviewExecutorForTests(async () => ({
      rows: [
        {
          rowIndex: 1,
          merchant: "Coffee",
          amount: 4.5,
          notes: "",
          date: "2026-03-10T00:00:00.000Z",
          type: "debit" as const,
          accountName: "Main Checking",
          categoryName: null,
          categoryGroup: null,
          budgetMonth: null,
          budgetYear: null,
          warnings: [],
        },
      ],
    }));

    const csvContent = "Date,Description,Amount\n2026-03-10,Coffee,-4.50\n";
    const file = new File([csvContent], "transactions.csv", { type: "text/csv" });

    try {
      const result = await createBulkTransactionPreview(primaryUserId, file);
      assert.equal(typeof result.previewId, "string");
      assert.ok(result.previewId.length > 0);
      assert.ok(Array.isArray(result.rows));
    } finally {
      setBulkTransactionPreviewExecutorForTests(null);
    }
  });

  test("commitBulkTransactions throws AccessDeniedException for account owned by another user", async () => {
    const otherUserAccountId = "019cf45e-80f5-714a-a121-bb32f8360020";
    await db.insertInto("accounts").values({
      id: otherUserAccountId,
      name: "Other User Account",
      type: "checking",
      balance: 0,
      userId: secondaryUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).executeTakeFirstOrThrow();

    await assert.rejects(
      async () =>
        commitBulkTransactions(primaryUserId, {
          previewId: "preview-1",
          rows: [
            {
              previewRowId: "019cf45e-80f5-714a-a121-bb32f8360030",
              merchant: "Test",
              amount: 10,
              notes: "",
              date: new Date(),
              type: "debit",
              accountId: otherUserAccountId,
              budgetItemId: "019cf45e-80f5-714a-a121-bb32f8360999",
              recurringTemplateId: null,
            },
          ],
        }),
      (err: any) => {
        assert.ok(err instanceof AccessDeniedException);
        return true;
      },
    );
  });

  test("commitBulkTransactions throws NotFoundException for non-existent budgetItem", async () => {
    await db.insertInto("accounts").values({
      id: VALID_UUID,
      name: "Main Checking",
      type: "checking",
      balance: 1000,
      userId: primaryUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).executeTakeFirstOrThrow();

    await assert.rejects(
      async () =>
        commitBulkTransactions(primaryUserId, {
          previewId: "preview-2",
          rows: [
            {
              previewRowId: "019cf45e-80f5-714a-a121-bb32f8360031",
              merchant: "Test",
              amount: 10,
              notes: "",
              date: new Date(),
              type: "debit",
              accountId: VALID_UUID,
              budgetItemId: "019cf45e-80f5-714a-a121-bb32f8360999",
              recurringTemplateId: null,
            },
          ],
        }),
      (err: any) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });
});
