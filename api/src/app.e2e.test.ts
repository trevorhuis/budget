import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";

import { app } from "./index.js";
import { closeDb, db } from "./db/database.js";
import {
  PRIMARY_USER_ID,
  SECONDARY_USER_ID,
  resetTestDatabase,
  setupTestDatabase,
} from "./test/test.utils.js";

type JsonValue = Record<string, unknown>;

const primaryHeaders = {
  "content-type": "application/json",
  "x-user-id": PRIMARY_USER_ID,
};

const secondaryHeaders = {
  "content-type": "application/json",
  "x-user-id": SECONDARY_USER_ID,
};

const request = async (
  path: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    json?: unknown;
  },
) => {
  const response = await app.request(path, {
    method: init?.method,
    headers: init?.headers,
    body: init?.json === undefined ? undefined : JSON.stringify(init.json),
  });

  return response;
};

const json = async (response: Response) => {
  return (await response.json()) as JsonValue;
};

const createAccount = async (
  accountId: string,
  overrides: Partial<{
    name: string;
    type: "savings" | "checking" | "credit";
    balance: number;
    headers: Record<string, string>;
  }> = {},
) => {
  const response = await request("/api/accounts", {
    method: "POST",
    headers: overrides.headers ?? primaryHeaders,
    json: {
      id: accountId,
      name: overrides.name ?? "Main checking",
      type: overrides.type ?? "checking",
      balance: overrides.balance ?? 1200.45,
    },
  });

  assert.equal(response.status, 201);
};

const createBudget = async (
  budgetId: string,
  overrides: Partial<{
    month: number;
    year: number;
    headers: Record<string, string>;
  }> = {},
) => {
  const response = await request("/api/budgets", {
    method: "POST",
    headers: overrides.headers ?? primaryHeaders,
    json: {
      id: budgetId,
      month: overrides.month ?? 3,
      year: overrides.year ?? 2026,
    },
  });

  assert.equal(response.status, 201);
};

const createCategory = async (
  categoryId: string,
  overrides: Partial<{
    name: string;
    type: "income" | "expense";
    status: "active" | "inactive";
    headers: Record<string, string>;
  }> = {},
) => {
  const response = await request("/api/categories", {
    method: "POST",
    headers: overrides.headers ?? primaryHeaders,
    json: {
      id: categoryId,
      name: overrides.name ?? "Groceries",
      type: overrides.type ?? "expense",
      status: overrides.status ?? "active",
    },
  });

  assert.equal(response.status, 201);
};

const createRecurringTemplate = async (
  templateId: string,
  categoryId: string,
  overrides: Partial<{
    merchant: string;
    amount: number;
    notes: string;
    headers: Record<string, string>;
  }> = {},
) => {
  const response = await request("/api/transactions/recurring", {
    method: "POST",
    headers: overrides.headers ?? primaryHeaders,
    json: {
      id: templateId,
      merchant: overrides.merchant ?? "Gym",
      amount: overrides.amount ?? 45,
      notes: overrides.notes ?? "Monthly membership",
      categoryId,
    },
  });

  assert.equal(response.status, 201);
};

before(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await resetTestDatabase();
});

after(async () => {
  await closeDb();
});

describe("health", () => {
  test("returns ok", async () => {
    const response = await request("/api/health");

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "OK!");
  });
});

describe("accounts router", () => {
  test("supports list, create, update, and delete", async () => {
    let response = await request("/api/accounts", {
      headers: primaryHeaders,
    });

    assert.equal(response.status, 200);
    assert.deepEqual((await json(response)).data, []);

    await createAccount("019cf45e-80f5-714a-a121-bb32f8364901");

    response = await request("/api/accounts", { headers: primaryHeaders });
    const listBody = await json(response);

    assert.equal(response.status, 200);
    assert.equal((listBody.data as JsonValue[]).length, 1);
    assert.equal((listBody.data as JsonValue[])[0]?.name, "Main checking");

    response = await request(
      "/api/accounts/019cf45e-80f5-714a-a121-bb32f8364901",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          name: "Updated checking",
          type: "savings",
          balance: 50,
        },
      },
    );

    assert.equal(response.status, 201);

    const row = await db
      .selectFrom("accounts")
      .selectAll()
      .where("id", "=", "019cf45e-80f5-714a-a121-bb32f8364901")
      .executeTakeFirstOrThrow();

    assert.equal(row.name, "Updated checking");
    assert.equal(row.type, "savings");
    assert.equal(row.balance, 50);

    response = await request(
      "/api/accounts/019cf45e-80f5-714a-a121-bb32f8364901",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual((await json(response)).data, {
      accountId: "019cf45e-80f5-714a-a121-bb32f8364901",
    });
  });

  test("covers validation, unauthorized, not found, and forbidden cases", async () => {
    let response = await request("/api/accounts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "anonymous",
      },
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364902",
        name: "No auth",
        type: "checking",
        balance: 0,
      },
    });

    assert.equal(response.status, 401);

    response = await request("/api/accounts", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "not-a-uuid",
        name: "Invalid",
        type: "checking",
        balance: 0,
      },
    });

    assert.equal(response.status, 400);

    response = await request(
      "/api/accounts/019cf45e-80f5-714a-a121-bb32f8364999",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );

    assert.equal(response.status, 404);

    await createAccount("019cf45e-80f5-714a-a121-bb32f8364903", {
      headers: secondaryHeaders,
    });

    response = await request(
      "/api/accounts/019cf45e-80f5-714a-a121-bb32f8364903",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          name: "Should fail",
          type: "credit",
          balance: 10,
        },
      },
    );

    assert.equal(response.status, 403);
  });
});

describe("buckets router", () => {
  test("supports full CRUD and corner cases", async () => {
    let response = await request("/api/buckets", { headers: primaryHeaders });
    assert.equal(response.status, 200);
    assert.deepEqual((await json(response)).data, []);

    response = await request("/api/buckets", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364a01",
        name: "Vacation",
        goal: 5000,
        current: 1200,
      },
    });
    assert.equal(response.status, 201);

    response = await request(
      "/api/buckets/019cf45e-80f5-714a-a121-bb32f8364a01",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          name: "Vacation 2026",
          goal: 6500,
          current: 1400,
        },
      },
    );
    assert.equal(response.status, 201);

    response = await request(
      "/api/buckets/019cf45e-80f5-714a-a121-bb32f8364a01",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 200);

    response = await request("/api/buckets", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "anonymous",
      },
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364a02",
        name: "Unauthorized",
        goal: 100,
        current: 0,
      },
    });
    assert.equal(response.status, 401);

    response = await request("/api/buckets/invalid-id", {
      method: "DELETE",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 400);

    await request("/api/buckets", {
      method: "POST",
      headers: secondaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364a03",
        name: "Other user bucket",
        goal: 300,
        current: 30,
      },
    });

    response = await request(
      "/api/buckets/019cf45e-80f5-714a-a121-bb32f8364a03",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 403);
  });
});

describe("budgets router", () => {
  test("supports full CRUD and ownership checks", async () => {
    let response = await request("/api/budgets", { headers: primaryHeaders });
    assert.equal(response.status, 200);
    assert.deepEqual((await json(response)).data, []);

    await createBudget("019cf45e-80f5-714a-a121-bb32f8364b01");

    response = await request(
      "/api/budgets/019cf45e-80f5-714a-a121-bb32f8364b01",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: { month: 4, year: 2026 },
      },
    );
    assert.equal(response.status, 201);

    response = await request(
      "/api/budgets/019cf45e-80f5-714a-a121-bb32f8364b99",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 404);

    await createBudget("019cf45e-80f5-714a-a121-bb32f8364b02", {
      headers: secondaryHeaders,
    });

    response = await request(
      "/api/budgets/019cf45e-80f5-714a-a121-bb32f8364b02",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 403);
  });
});

describe("categories router", () => {
  test("supports full CRUD and validation", async () => {
    let response = await request("/api/categories", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364c01",
        name: "Paycheck",
        type: "income",
        status: "active",
      },
    });
    assert.equal(response.status, 201);

    response = await request("/api/categories", { headers: primaryHeaders });
    const listBody = await json(response);
    assert.equal((listBody.data as JsonValue[]).length, 1);

    response = await request(
      "/api/categories/019cf45e-80f5-714a-a121-bb32f8364c01",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          name: "Salary",
          type: "income",
          status: "inactive",
        },
      },
    );
    assert.equal(response.status, 201);

    response = await request("/api/categories", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364c02",
        name: "Invalid",
        type: "sideways",
        status: "active",
      },
    });
    assert.equal(response.status, 400);

    await createCategory("019cf45e-80f5-714a-a121-bb32f8364c03", {
      headers: secondaryHeaders,
    });

    response = await request(
      "/api/categories/019cf45e-80f5-714a-a121-bb32f8364c03",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 403);
  });
});

describe("budget items router", () => {
  test("supports full CRUD and missing-reference handling", async () => {
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364d01");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364d02");

    let response = await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364d03",
        name: "Groceries line",
        allocatedAmount: 500,
        actualAmount: 120,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364d01",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364d02",
      },
    });
    assert.equal(response.status, 201);

    response = await request("/api/budgetItems", { headers: primaryHeaders });
    assert.equal(response.status, 200);
    assert.equal(((await json(response)).data as JsonValue[]).length, 1);

    response = await request(
      "/api/budgetItems/019cf45e-80f5-714a-a121-bb32f8364d03",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          name: "Groceries line updated",
          allocatedAmount: 650,
          actualAmount: 300,
        },
      },
    );
    assert.equal(response.status, 201);

    response = await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364d04",
        name: "Broken refs",
        allocatedAmount: 100,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364dff",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364d02",
      },
    });
    assert.equal(response.status, 404);

    await createBudget("019cf45e-80f5-714a-a121-bb32f8364d05", {
      headers: secondaryHeaders,
    });
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364d06", {
      headers: secondaryHeaders,
    });

    response = await request("/api/budgetItems", {
      method: "POST",
      headers: secondaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364d07",
        name: "Other user item",
        allocatedAmount: 50,
        actualAmount: 25,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364d05",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364d06",
      },
    });
    assert.equal(response.status, 201);

    response = await request(
      "/api/budgetItems/019cf45e-80f5-714a-a121-bb32f8364d07",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 403);
  });
});

describe("recurring transaction router", () => {
  test("supports full CRUD and category ownership checks", async () => {
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364e01");

    let response = await request("/api/transactions/recurring", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364e02",
        merchant: "Internet Provider",
        amount: 89.99,
        notes: "Monthly bill",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364e01",
      },
    });
    assert.equal(response.status, 201);

    response = await request("/api/transactions/recurring", {
      headers: primaryHeaders,
    });
    assert.equal(response.status, 200);
    assert.equal(((await json(response)).data as JsonValue[]).length, 1);

    response = await request(
      "/api/transactions/recurring/019cf45e-80f5-714a-a121-bb32f8364e02",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          merchant: "ISP",
          amount: 92.5,
          notes: "Updated bill",
        },
      },
    );
    assert.equal(response.status, 201);

    response = await request("/api/transactions/recurring", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364e03",
        merchant: "Missing category",
        amount: 10,
        notes: "Should fail",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364eff",
      },
    });
    assert.equal(response.status, 404);

    await createCategory("019cf45e-80f5-714a-a121-bb32f8364e04", {
      headers: secondaryHeaders,
    });
    await createRecurringTemplate(
      "019cf45e-80f5-714a-a121-bb32f8364e05",
      "019cf45e-80f5-714a-a121-bb32f8364e04",
      { headers: secondaryHeaders },
    );

    response = await request(
      "/api/transactions/recurring/019cf45e-80f5-714a-a121-bb32f8364e05",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 403);
  });
});

describe("transactions router", () => {
  test("supports full CRUD, foreign key validation, and ownership checks", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await createRecurringTemplate(
      "019cf45e-80f5-714a-a121-bb32f8364f04",
      "019cf45e-80f5-714a-a121-bb32f8364f03",
    );

    let response = await request("/api/transactions", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f05",
        merchant: "Trader Joe's",
        amount: 123.45,
        notes: "Weekly groceries",
        date: "2026-03-10T12:00:00.000Z",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
        recurringTemplateId: "019cf45e-80f5-714a-a121-bb32f8364f04",
      },
    });
    assert.equal(response.status, 201);

    response = await request("/api/transactions", {
      headers: primaryHeaders,
    });
    const listBody = await json(response);
    assert.equal(response.status, 200);
    assert.equal((listBody.data as JsonValue[]).length, 1);

    response = await request(
      "/api/transactions/019cf45e-80f5-714a-a121-bb32f8364f05",
      {
        method: "PUT",
        headers: primaryHeaders,
        json: {
          merchant: "Trader Joe's Oak Park",
          amount: 150,
          notes: "Updated groceries",
          date: "2026-03-11T12:00:00.000Z",
        },
      },
    );
    assert.equal(response.status, 201);

    response = await request("/api/transactions", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f06",
        merchant: "Broken tx",
        amount: 10,
        notes: "Missing account",
        date: "2026-03-10T12:00:00.000Z",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364fff",
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });
    assert.equal(response.status, 404);

    response = await request("/api/transactions", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f07",
        merchant: "Bad payload",
        amount: 10,
        notes: "Invalid date",
        date: "not-a-date",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });
    assert.equal(response.status, 400);

    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f08", {
      headers: secondaryHeaders,
    });
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f09", {
      headers: secondaryHeaders,
    });
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f10", {
      headers: secondaryHeaders,
    });

    response = await request("/api/transactions", {
      method: "POST",
      headers: secondaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f11",
        merchant: "Other user tx",
        amount: 22,
        notes: "Owned by secondary user",
        date: "2026-03-12T12:00:00.000Z",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f08",
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f09",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f10",
      },
    });
    assert.equal(response.status, 201);

    response = await request(
      "/api/transactions/019cf45e-80f5-714a-a121-bb32f8364f11",
      {
        method: "DELETE",
        headers: primaryHeaders,
      },
    );
    assert.equal(response.status, 403);
  });
});
