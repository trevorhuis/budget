import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";

import { app } from "./index.js";
import { setBulkTransactionPreviewExecutorForTests } from "./core/transaction/transactionBulk.openai.js";
import { closeDb, db } from "./db/database.js";
import { buildBudgetChatTools } from "./core/chat/chat.tools.js";
import { resetTestDatabase, setupTestDatabase } from "./test/test.utils.js";

type JsonValue = Record<string, unknown>;

type TestAuthSession = {
  userId: string;
  headers: Record<string, string>;
};

const authHeaders = {
  "content-type": "application/json",
  origin: "http://localhost:5173",
};

let primaryUserId = "";
let secondaryUserId = "";
let primaryHeaders: Record<string, string> = authHeaders;
let secondaryHeaders: Record<string, string> = authHeaders;

const request = async (
  path: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    json?: unknown;
    body?: BodyInit;
  },
) => {
  const headers = new Headers(init?.headers);

  if (init?.body instanceof FormData) {
    headers.delete("content-type");
  } else if (init?.json !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await app.request(path, {
    method: init?.method,
    headers,
    body:
      init?.body ??
      (init?.json === undefined ? undefined : JSON.stringify(init.json)),
  });

  return response;
};

const json = async (response: Response) => {
  return (await response.json()) as JsonValue;
};

const getSetCookieHeaders = (response: Response) => {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const setCookie = response.headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
};

const toCookieHeader = (response: Response) => {
  return getSetCookieHeaders(response)
    .map((value) => value.split(";", 1)[0])
    .join("; ");
};

const createAuthenticatedSession = async ({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}): Promise<TestAuthSession> => {
  const response = await request("/api/auth/sign-up/email", {
    method: "POST",
    headers: authHeaders,
    json: {
      name,
      email,
      password,
    },
  });

  assert.equal(response.status, 200);

  const body = await json(response);
  const cookie = toCookieHeader(response);

  assert.equal(typeof body.user, "object");
  assert.equal(typeof cookie, "string");
  assert.notEqual(cookie.length, 0);

  return {
    userId: (body.user as JsonValue).id as string,
    headers: {
      ...authHeaders,
      cookie,
    },
  };
};

const createAccount = async (
  accountId: string,
  overrides: Partial<{
    name: string;
    type: "savings" | "checking" | "creditCard";
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
    group: string;
    status: string;
    headers: Record<string, string>;
  }> = {},
) => {
  const response = await request("/api/categories", {
    method: "POST",
    headers: overrides.headers ?? primaryHeaders,
    json: {
      id: categoryId,
      name: overrides.name ?? "Groceries",
      group: overrides.group ?? "Essentials",
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
    recurringDate: number;
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
      recurringDate: overrides.recurringDate ?? 1,
      categoryId,
    },
  });

  assert.equal(response.status, 201);
};

const seedChatDomainData = async () => {
  await createAccount("019cf45e-80f5-714a-a121-bb32f8365101");
  await createAccount("019cf45e-80f5-714a-a121-bb32f8365102", {
    name: "Rewards Card",
    type: "creditCard",
    balance: -200,
  });
  await createBudget("019cf45e-80f5-714a-a121-bb32f8365103", {
    month: 3,
    year: 2026,
  });
  await createCategory("019cf45e-80f5-714a-a121-bb32f8365104", {
    name: "Groceries",
    group: "Essentials",
  });
  await createCategory("019cf45e-80f5-714a-a121-bb32f8365105", {
    name: "Salary",
    group: "Income",
  });
  await createCategory("019cf45e-80f5-714a-a121-bb32f8365106", {
    name: "Utilities",
    group: "Bills",
  });

  let response = await request("/api/budgetItems", {
    method: "POST",
    headers: primaryHeaders,
    json: {
      id: "019cf45e-80f5-714a-a121-bb32f8365107",
      targetAmount: 500,
      actualAmount: 120,
      budgetId: "019cf45e-80f5-714a-a121-bb32f8365103",
      categoryId: "019cf45e-80f5-714a-a121-bb32f8365104",
    },
  });
  assert.equal(response.status, 201);

  response = await request("/api/budgetItems", {
    method: "POST",
    headers: primaryHeaders,
    json: {
      id: "019cf45e-80f5-714a-a121-bb32f8365108",
      targetAmount: 1500,
      actualAmount: -1000,
      budgetId: "019cf45e-80f5-714a-a121-bb32f8365103",
      categoryId: "019cf45e-80f5-714a-a121-bb32f8365105",
    },
  });
  assert.equal(response.status, 201);

  await createRecurringTemplate(
    "019cf45e-80f5-714a-a121-bb32f8365109",
    "019cf45e-80f5-714a-a121-bb32f8365106",
    {
      merchant: "Electric Co",
      amount: 90,
      notes: "Monthly electric",
      recurringDate: 15,
    },
  );

  response = await request("/api/transactions", {
    method: "POST",
    headers: primaryHeaders,
    json: {
      id: "019cf45e-80f5-714a-a121-bb32f8365110",
      merchant: "Whole Foods",
      amount: 120,
      notes: "Weekly groceries",
      date: "2026-03-04T12:00:00.000Z",
      type: "debit",
      accountId: "019cf45e-80f5-714a-a121-bb32f8365101",
      budgetItemId: "019cf45e-80f5-714a-a121-bb32f8365107",
    },
  });
  assert.equal(response.status, 201);

  response = await request("/api/transactions", {
    method: "POST",
    headers: primaryHeaders,
    json: {
      id: "019cf45e-80f5-714a-a121-bb32f8365111",
      merchant: "Trader Joe's",
      amount: 80,
      notes: "More groceries",
      date: "2026-03-05T12:00:00.000Z",
      type: "debit",
      accountId: "019cf45e-80f5-714a-a121-bb32f8365101",
      budgetItemId: "019cf45e-80f5-714a-a121-bb32f8365107",
    },
  });
  assert.equal(response.status, 201);

  response = await request("/api/transactions", {
    method: "POST",
    headers: primaryHeaders,
    json: {
      id: "019cf45e-80f5-714a-a121-bb32f8365112",
      merchant: "Employer",
      amount: 1000,
      notes: "Salary deposit",
      date: "2026-03-01T12:00:00.000Z",
      type: "credit",
      accountId: "019cf45e-80f5-714a-a121-bb32f8365101",
      budgetItemId: "019cf45e-80f5-714a-a121-bb32f8365108",
    },
  });
  assert.equal(response.status, 201);

  response = await request("/api/transactions", {
    method: "POST",
    headers: primaryHeaders,
    json: {
      id: "019cf45e-80f5-714a-a121-bb32f8365113",
      merchant: "Electric Co",
      amount: 90,
      notes: "Power bill",
      date: "2026-03-15T12:00:00.000Z",
      type: "debit",
      accountId: "019cf45e-80f5-714a-a121-bb32f8365102",
      budgetItemId: "019cf45e-80f5-714a-a121-bb32f8365107",
      recurringTemplateId: "019cf45e-80f5-714a-a121-bb32f8365109",
    },
  });
  assert.equal(response.status, 201);

  await createBudget("019cf45e-80f5-714a-a121-bb32f8365114", {
    headers: secondaryHeaders,
    month: 4,
    year: 2026,
  });
};

before(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await resetTestDatabase();
  setBulkTransactionPreviewExecutorForTests(null);
  const [primarySession, secondarySession] = await Promise.all([
    createAuthenticatedSession({
      email: "primary@example.com",
      name: "Primary Tester",
      password: "Password123!",
    }),
    createAuthenticatedSession({
      email: "secondary@example.com",
      name: "Secondary Tester",
      password: "Password123!",
    }),
  ]);

  primaryUserId = primarySession.userId;
  secondaryUserId = secondarySession.userId;
  primaryHeaders = primarySession.headers;
  secondaryHeaders = secondarySession.headers;
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
      headers: authHeaders,
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
          type: "creditCard",
          balance: 10,
        },
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
        group: "Income",
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
          group: "Career",
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
        group: "Income",
        status: 10,
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
        targetAmount: 500,
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
          targetAmount: 650,
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
        targetAmount: 100,
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
        targetAmount: 50,
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
        recurringDate: 15,
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
          recurringDate: 16,
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
        recurringDate: 5,
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
  test("supports full CRUD, uncategorized transactions, foreign key validation, and ownership checks", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f13",
        targetAmount: 500,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });
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
        type: "debit",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
        budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
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

    response = await request("/api/transactions", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f12",
        merchant: "Cash Withdrawal",
        amount: 40,
        notes: "No category assigned yet",
        date: "2026-03-11T09:00:00.000Z",
        type: "debit",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
        budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
      },
    });
    assert.equal(response.status, 201);

    const uncategorizedTransaction = await db
      .selectFrom("transactions")
      .selectAll()
      .where("id", "=", "019cf45e-80f5-714a-a121-bb32f8364f12")
      .executeTakeFirstOrThrow();

    assert.equal(
      uncategorizedTransaction.budgetItemId,
      "019cf45e-80f5-714a-a121-bb32f8364f13",
    );

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
          type: "credit",
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
        type: "debit",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364fff",
        budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
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
        type: "debit",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
        budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
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
    await request("/api/budgetItems", {
      method: "POST",
      headers: secondaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f14",
        targetAmount: 300,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f09",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f10",
      },
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
        type: "debit",
        accountId: "019cf45e-80f5-714a-a121-bb32f8364f08",
        budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f14",
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

  test("returns 401 for bulk preview without a valid user", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File(
        ["Date,Description,Amount\n2026-03-10,Coffee,-4.5\n"],
        "transactions.csv",
        {
          type: "text/csv",
        },
      ),
    );

    const response = await request("/api/transactions/bulk/preview", {
      method: "POST",
      body: formData,
    });

    assert.equal(response.status, 401);
  });

  test("returns 500 for bulk preview when OpenAI API key is not configured", async () => {
    const originalOpenAiKey = process.env.OPENAI_API_KEY;
    const originalLegacyKey = process.env.OPEN_AI_API_KEY;

    delete process.env.OPENAI_API_KEY;
    delete process.env.OPEN_AI_API_KEY;

    const formData = new FormData();
    formData.set(
      "file",
      new File(
        ["Date,Description,Amount\n2026-03-10,Coffee,-4.5\n"],
        "transactions.csv",
        {
          type: "text/csv",
        },
      ),
    );

    const response = await request("/api/transactions/bulk/preview", {
      method: "POST",
      headers: primaryHeaders,
      body: formData,
    });

    process.env.OPENAI_API_KEY = originalOpenAiKey;
    process.env.OPEN_AI_API_KEY = originalLegacyKey;

    assert.equal(response.status, 500);
    assert.equal((await json(response)).error, "OPENAI_API_KEY not configured");
  });

  test("returns OpenAI-backed bulk preview rows with resolved account and budget item ids", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f13",
        targetAmount: 500,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });

    setBulkTransactionPreviewExecutorForTests(async () => ({
      rows: [
        {
          rowIndex: 1,
          merchant: "Trader Joe's",
          amount: 23.45,
          notes: "Weekly groceries",
          date: "2026-03-10T00:00:00.000Z",
          type: "debit",
          accountName: "Main checking",
          categoryName: "Groceries",
          categoryGroup: "Essentials",
          budgetMonth: 3,
          budgetYear: 2026,
          warnings: [],
        },
      ],
    }));

    const formData = new FormData();
    formData.set(
      "file",
      new File(
        ["Date,Description,Amount\n2026-03-10,Trader Joe's,-23.45\n"],
        "transactions.csv",
        {
          type: "text/csv",
        },
      ),
    );

    const response = await request("/api/transactions/bulk/preview", {
      method: "POST",
      headers: primaryHeaders,
      body: formData,
    });

    const body = await json(response);
    const rows = (body.data as JsonValue).rows as JsonValue[];

    assert.equal(response.status, 200);
    assert.equal(typeof (body.data as JsonValue).previewId, "string");
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.merchant, "Trader Joe's");
    assert.equal(rows[0]?.accountId, "019cf45e-80f5-714a-a121-bb32f8364f01");
    assert.equal(rows[0]?.budgetItemId, "019cf45e-80f5-714a-a121-bb32f8364f13");
  });

  test("returns partial preview rows with warnings when account and budget line matches cannot be resolved", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f13",
        targetAmount: 500,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });

    setBulkTransactionPreviewExecutorForTests(async () => ({
      rows: [
        {
          rowIndex: 1,
          merchant: "Mystery Charge",
          amount: 45,
          notes: "",
          date: "2026-03-10T00:00:00.000Z",
          type: "debit",
          accountName: "Unknown account",
          categoryName: "Utilities",
          categoryGroup: "Bills",
          budgetMonth: 4,
          budgetYear: 2026,
          warnings: ["Account and category could not be inferred confidently."],
        },
      ],
    }));

    const formData = new FormData();
    formData.set(
      "file",
      new File(
        ["Date,Description,Amount\n2026-03-10,Mystery Charge,-45\n"],
        "transactions.csv",
        {
          type: "text/csv",
        },
      ),
    );

    const response = await request("/api/transactions/bulk/preview", {
      method: "POST",
      headers: primaryHeaders,
      body: formData,
    });

    const body = await json(response);
    const row = ((body.data as JsonValue).rows as JsonValue[])[0] as JsonValue;

    assert.equal(response.status, 200);
    assert.equal(row.accountId, null);
    assert.equal(row.budgetItemId, null);
    assert.equal(Array.isArray(row.warnings), true);
    assert.equal((row.warnings as JsonValue[]).length > 0, true);
  });

  test("rejects bulk preview uploads that exceed the row limit", async () => {
    const csvLines = ["Date,Description,Amount"];
    for (let index = 0; index < 501; index += 1) {
      csvLines.push(`2026-03-10,Row ${index},-1.00`);
    }

    const formData = new FormData();
    formData.set(
      "file",
      new File([csvLines.join("\n")], "transactions.csv", {
        type: "text/csv",
      }),
    );

    const response = await request("/api/transactions/bulk/preview", {
      method: "POST",
      headers: primaryHeaders,
      body: formData,
    });

    assert.equal(response.status, 413);
  });

  test("returns 401 for bulk commit without a valid user", async () => {
    const response = await request("/api/transactions/bulk", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      json: {
        previewId: "preview-1",
        rows: [
          {
            previewRowId: "019cf45e-80f5-714a-a121-bb32f8364f21",
            merchant: "Coffee",
            amount: 4.5,
            notes: "",
            date: "2026-03-10T12:00:00.000Z",
            type: "debit",
            accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
            budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
            recurringTemplateId: null,
          },
        ],
      },
    });

    assert.equal(response.status, 401);
  });

  test("commits bulk reviewed rows and updates budget item actual amounts atomically", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f13",
        targetAmount: 500,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });

    const response = await request("/api/transactions/bulk", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        previewId: "preview-1",
        rows: [
          {
            previewRowId: "019cf45e-80f5-714a-a121-bb32f8364f21",
            merchant: "Trader Joe's",
            amount: 25,
            notes: "Groceries",
            date: "2026-03-10T12:00:00.000Z",
            type: "debit",
            accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
            budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
            recurringTemplateId: null,
          },
          {
            previewRowId: "019cf45e-80f5-714a-a121-bb32f8364f22",
            merchant: "Refund",
            amount: 10,
            notes: "",
            date: "2026-03-11T12:00:00.000Z",
            type: "credit",
            accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
            budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
            recurringTemplateId: null,
          },
        ],
      },
    });

    const body = await json(response);
    const transactions = await db
      .selectFrom("transactions")
      .selectAll()
      .execute();
    const budgetItem = await db
      .selectFrom("budgetItems")
      .selectAll()
      .where("id", "=", "019cf45e-80f5-714a-a121-bb32f8364f13")
      .executeTakeFirstOrThrow();

    assert.equal(response.status, 201);
    assert.equal((body.data as JsonValue).createdCount, 2);
    assert.equal((body.data as JsonValue).affectedBudgetItemCount, 1);
    assert.equal(transactions.length, 2);
    assert.equal(budgetItem.actualAmount, 15);
  });

  test("rejects bulk commit rows that reference another user's account", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f13",
        targetAmount: 500,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f08", {
      headers: secondaryHeaders,
    });

    const response = await request("/api/transactions/bulk", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        previewId: "preview-2",
        rows: [
          {
            previewRowId: "019cf45e-80f5-714a-a121-bb32f8364f23",
            merchant: "Coffee",
            amount: 5,
            notes: "",
            date: "2026-03-10T12:00:00.000Z",
            type: "debit",
            accountId: "019cf45e-80f5-714a-a121-bb32f8364f08",
            budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
            recurringTemplateId: null,
          },
        ],
      },
    });

    assert.equal(response.status, 403);
  });

  test("keeps bulk commit atomic when one reviewed row is invalid", async () => {
    await createAccount("019cf45e-80f5-714a-a121-bb32f8364f01");
    await createBudget("019cf45e-80f5-714a-a121-bb32f8364f02");
    await createCategory("019cf45e-80f5-714a-a121-bb32f8364f03");
    await request("/api/budgetItems", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8364f13",
        targetAmount: 500,
        actualAmount: 0,
        budgetId: "019cf45e-80f5-714a-a121-bb32f8364f02",
        categoryId: "019cf45e-80f5-714a-a121-bb32f8364f03",
      },
    });

    const response = await request("/api/transactions/bulk", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        previewId: "preview-3",
        rows: [
          {
            previewRowId: "019cf45e-80f5-714a-a121-bb32f8364f24",
            merchant: "Coffee",
            amount: 5,
            notes: "",
            date: "2026-03-10T12:00:00.000Z",
            type: "debit",
            accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
            budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364f13",
            recurringTemplateId: null,
          },
          {
            previewRowId: "019cf45e-80f5-714a-a121-bb32f8364f25",
            merchant: "Bad row",
            amount: 9,
            notes: "",
            date: "2026-03-10T12:00:00.000Z",
            type: "debit",
            accountId: "019cf45e-80f5-714a-a121-bb32f8364f01",
            budgetItemId: "019cf45e-80f5-714a-a121-bb32f8364fff",
            recurringTemplateId: null,
          },
        ],
      },
    });

    const transactions = await db
      .selectFrom("transactions")
      .selectAll()
      .execute();
    const budgetItem = await db
      .selectFrom("budgetItems")
      .selectAll()
      .where("id", "=", "019cf45e-80f5-714a-a121-bb32f8364f13")
      .executeTakeFirstOrThrow();

    assert.equal(response.status, 404);
    assert.equal(transactions.length, 0);
    assert.equal(budgetItem.actualAmount, 0);
  });
});

describe("chat router", () => {
  test("returns 401 when no valid user is resolved", async () => {
    const response = await request("/api/chat", {
      method: "POST",
      headers: authHeaders,
      json: {
        messages: [{ role: "user", content: "Help me understand my budget" }],
      },
    });

    assert.equal(response.status, 401);
  });

  test("returns 500 when OpenAI API key is not configured", async () => {
    const originalOpenAiKey = process.env.OPENAI_API_KEY;
    const originalLegacyKey = process.env.OPEN_AI_API_KEY;

    delete process.env.OPENAI_API_KEY;
    delete process.env.OPEN_AI_API_KEY;

    const response = await request("/api/chat", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        messages: [{ role: "user", content: "Help me understand my budget" }],
      },
    });

    process.env.OPENAI_API_KEY = originalOpenAiKey;
    process.env.OPEN_AI_API_KEY = originalLegacyKey;

    assert.equal(response.status, 500);
    assert.equal((await json(response)).error, "OPENAI_API_KEY not configured");
  });
});

describe("calculators router", () => {
  test("supports full CRUD, duplicate, share, and ownership checks", async () => {
    let response = await request("/api/calculators", { headers: primaryHeaders });
    assert.equal(response.status, 200);
    assert.deepEqual((await json(response)).data, []);

    response = await request("/api/calculators", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8365c01",
        name: "Mortgage Calc",
        calculatorType: "mortgage",
        data: { principal: 300000, rate: 6.5, termYears: 30 },
      },
    });
    assert.equal(response.status, 201);

    response = await request("/api/calculators", { headers: primaryHeaders });
    const listBody = await json(response);
    assert.equal(response.status, 200);
    assert.equal((listBody.data as JsonValue[]).length, 1);
    assert.equal((listBody.data as JsonValue[])[0]?.name, "Mortgage Calc");
    assert.equal((listBody.data as JsonValue[])[0]?.calculatorType, "mortgage");

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01", {
      headers: primaryHeaders,
    });
    assert.equal(response.status, 200);
    assert.equal((await json(response)).data.name, "Mortgage Calc");

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01", {
      method: "PUT",
      headers: primaryHeaders,
      json: {
        name: "Updated Mortgage Calc",
        calculatorType: "mortgage",
        data: { principal: 350000, rate: 6.0, termYears: 15 },
      },
    });
    assert.equal(response.status, 200);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01", {
      headers: primaryHeaders,
    });
    assert.equal((await json(response)).data.name, "Updated Mortgage Calc");

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01/duplicate", {
      method: "POST",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 201);
    const duplicateBody = await json(response);
    assert.equal((duplicateBody.data as JsonValue).name, "Updated Mortgage Calc Copy");

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01/share", {
      method: "POST",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 200);
    const shareToken = (await json(response)).data as JsonValue;
    assert.equal(typeof shareToken.shareToken, "string");

    response = await request(`/api/calculators/shared/${shareToken.shareToken}`);
    assert.equal(response.status, 200);
    assert.equal((await json(response)).data.name, "Updated Mortgage Calc");

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01/share", {
      method: "DELETE",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 200);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01", {
      headers: primaryHeaders,
    });
    assert.equal(response.status, 200);
    assert.equal((await json(response)).data.shareToken, null);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c01", {
      method: "DELETE",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 200);

    response = await request("/api/calculators", { headers: primaryHeaders });
    assert.deepEqual((await json(response)).data, []);
  });

  test("returns 404 for shared token that does not exist", async () => {
    const response = await request("/api/calculators/shared/not-a-real-token");
    assert.equal(response.status, 404);
  });

  test("returns 401 for unauthenticated list and create", async () => {
    let response = await request("/api/calculators");
    assert.equal(response.status, 401);

    response = await request("/api/calculators", {
      method: "POST",
      headers: authHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8365c02",
        name: "Loan Calc",
        calculatorType: "loan",
        data: {},
      },
    });
    assert.equal(response.status, 401);
  });

  test("returns 403 when accessing another user's calculator", async () => {
    let response = await request("/api/calculators", {
      method: "POST",
      headers: secondaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8365c03",
        name: "Secondary Calc",
        calculatorType: "debtPayoff",
        data: {},
      },
    });
    assert.equal(response.status, 201);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c03", {
      headers: primaryHeaders,
    });
    assert.equal(response.status, 403);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c03", {
      method: "PUT",
      headers: primaryHeaders,
      json: { name: "Hijacked", calculatorType: "loan", data: {} },
    });
    assert.equal(response.status, 403);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c03/duplicate", {
      method: "POST",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 403);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c03/share", {
      method: "POST",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 403);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365c03", {
      method: "DELETE",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 403);
  });

  test("returns 404 for non-existent calculator id", async () => {
    let response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365fff", {
      headers: primaryHeaders,
    });
    assert.equal(response.status, 404);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365fff", {
      method: "PUT",
      headers: primaryHeaders,
      json: { name: "Test", calculatorType: "mortgage", data: {} },
    });
    assert.equal(response.status, 404);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365fff/duplicate", {
      method: "POST",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 404);

    response = await request("/api/calculators/019cf45e-80f5-714a-a121-bb32f8365fff/share", {
      method: "POST",
      headers: primaryHeaders,
    });
    assert.equal(response.status, 404);
  });

  test("returns 400 for invalid calculator create payload", async () => {
    const response = await request("/api/calculators", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8365c04",
        name: "",
        calculatorType: "mortgage",
        data: {},
      },
    });
    assert.equal(response.status, 400);

    const response2 = await request("/api/calculators", {
      method: "POST",
      headers: primaryHeaders,
      json: {
        id: "019cf45e-80f5-714a-a121-bb32f8365c05",
        name: "Bad Type",
        calculatorType: "invalidType",
        data: {},
      },
    });
    assert.equal(response2.status, 400);
  });
});

describe("auth endpoints", () => {
  test("signs up a new user and returns a session cookie", async () => {
    const response = await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "New User",
        email: "newuser@example.com",
        password: "SecurePass123!",
      },
    });

    assert.equal(response.status, 200);
    const body = await json(response);
    assert.equal(typeof body.user, "object");
    assert.equal((body.user as JsonValue).email, "newuser@example.com");

    const cookie = toCookieHeader(response);
    assert.notEqual(cookie.length, 0);
    assert.ok(cookie.includes("better-auth.session_token"));
  });

  test("signs in an existing user and returns a session cookie", async () => {
    await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "SignIn User",
        email: "signin@example.com",
        password: "SecurePass123!",
      },
    });

    const response = await request("/api/auth/sign-in/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        email: "signin@example.com",
        password: "SecurePass123!",
      },
    });

    assert.equal(response.status, 200);
    const body = await json(response);
    assert.equal(typeof body.user, "object");
    assert.equal((body.user as JsonValue).email, "signin@example.com");

    const cookie = toCookieHeader(response);
    assert.notEqual(cookie.length, 0);
  });

  test("returns 400 for sign-up with invalid email", async () => {
    const response = await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "Bad Email",
        email: "not-an-email",
        password: "SecurePass123!",
      },
    });

    assert.equal(response.status, 400);
  });

  test("returns 400 for sign-in with wrong password", async () => {
    await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "Wrong Pass",
        email: "wrongpass@example.com",
        password: "CorrectPass123!",
      },
    });

    const response = await request("/api/auth/sign-in/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        email: "wrongpass@example.com",
        password: "WrongPass123!",
      },
    });

    assert.equal(response.status, 400);
  });

  test("returns 400 for sign-up with missing fields", async () => {
    const response = await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        email: "missing@example.com",
      },
    });
    assert.equal(response.status, 400);

    const response2 = await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "Missing Email",
        password: "SecurePass123!",
      },
    });
    assert.equal(response2.status, 400);
  });

  test("signs out and clears session cookie", async () => {
    await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "SignOut User",
        email: "signout@example.com",
        password: "SecurePass123!",
      },
    });

    const signInResponse = await request("/api/auth/sign-in/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        email: "signout@example.com",
        password: "SecurePass123!",
      },
    });
    const cookie = toCookieHeader(signInResponse);

    const response = await request("/api/auth/sign-out", {
      method: "POST",
      headers: { ...authHeaders, cookie },
    });

    assert.equal(response.status, 200);

    const setCookie = response.headers.get("set-cookie");
    assert.ok(setCookie?.includes("better-auth.session_token="));
  });

  test("get session returns user data with valid cookie", async () => {
    await request("/api/auth/sign-up/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        name: "Session Test",
        email: "session@example.com",
        password: "SecurePass123!",
      },
    });

    const signInResponse = await request("/api/auth/sign-in/email", {
      method: "POST",
      headers: authHeaders,
      json: {
        email: "session@example.com",
        password: "SecurePass123!",
      },
    });
    const cookie = toCookieHeader(signInResponse);

    const response = await request("/api/auth/get-session", {
      headers: { ...authHeaders, cookie },
    });

    assert.equal(response.status, 200);
    const body = await json(response);
    assert.equal((body.user as JsonValue).email, "session@example.com");
  });
});

describe("budget chat tools", () => {
  test("provide read-only budget domain tools with scoped data and computed summaries", async () => {
    await seedChatDomainData();

    const tools = buildBudgetChatTools(primaryUserId);
    const getTool = (name: string) => {
      const tool = tools.find((entry) => entry.name === name);
      assert.ok(tool);
      assert.ok(tool.execute);
      return tool;
    };

    assert.deepEqual(
      tools.map((tool) => tool.name),
      [
        "list_budgets",
        "get_budget",
        "list_budget_items",
        "get_budget_item",
        "analyze_budget_item_spend",
        "list_transactions",
        "get_transaction",
        "summarize_transactions",
        "list_recurring_transactions",
        "get_recurring_transaction",
        "summarize_recurring_commitments",
      ],
    );

    const budgets = (await getTool("list_budgets").execute?.({
      month: 3,
    })) as JsonValue[];
    assert.equal(budgets.length, 1);
    assert.equal(budgets[0]?.id, "019cf45e-80f5-714a-a121-bb32f8365103");

    const budget = (await getTool("get_budget").execute?.({
      budgetId: "019cf45e-80f5-714a-a121-bb32f8365103",
    })) as JsonValue;
    assert.equal(budget.itemCount, 2);
    assert.equal(budget.targetTotal, 2000);
    assert.equal(budget.actualTotal, -880);
    assert.equal(budget.varianceTotal, 2880);

    const budgetItems = (await getTool("list_budget_items").execute?.({
      budgetId: "019cf45e-80f5-714a-a121-bb32f8365103",
    })) as JsonValue[];
    assert.equal(budgetItems.length, 2);
    assert.equal(budgetItems[0]?.category ? true : false, true);

    const budgetItem = (await getTool("get_budget_item").execute?.({
      budgetItemId: "019cf45e-80f5-714a-a121-bb32f8365107",
    })) as JsonValue;
    assert.equal((budgetItem.recentTransactions as JsonValue[]).length, 3);

    const spendAnalysis = (await getTool("analyze_budget_item_spend").execute?.(
      {
        budgetItemId: "019cf45e-80f5-714a-a121-bb32f8365107",
      },
    )) as JsonValue;
    assert.equal(spendAnalysis.transactionCount, 3);
    assert.equal(spendAnalysis.debitTotal, 290);
    assert.equal(spendAnalysis.creditTotal, 0);

    const filteredTransactions = (await getTool("list_transactions").execute?.({
      merchantQuery: "Electric",
      recurringOnly: true,
    })) as JsonValue[];
    assert.equal(filteredTransactions.length, 1);
    assert.equal(filteredTransactions[0]?.merchant, "Electric Co");

    const transaction = (await getTool("get_transaction").execute?.({
      transactionId: "019cf45e-80f5-714a-a121-bb32f8365113",
    })) as JsonValue;
    assert.equal((transaction.account as JsonValue).name, "Rewards Card");
    assert.equal(
      (transaction.recurringTemplate as JsonValue).merchant,
      "Electric Co",
    );

    const transactionSummary = (await getTool(
      "summarize_transactions",
    ).execute?.({
      groupBy: "type",
    })) as JsonValue;
    assert.equal(transactionSummary.transactionCount, 4);
    assert.equal(transactionSummary.debitTotal, 290);
    assert.equal(transactionSummary.creditTotal, 1000);
    assert.equal(transactionSummary.netTotal, 710);

    const recurringTransactions = (await getTool(
      "list_recurring_transactions",
    ).execute?.({})) as JsonValue[];
    assert.equal(recurringTransactions.length, 1);
    assert.equal(
      (recurringTransactions[0]?.category as JsonValue).name,
      "Utilities",
    );

    const recurringTransaction = (await getTool(
      "get_recurring_transaction",
    ).execute?.({
      templateId: "019cf45e-80f5-714a-a121-bb32f8365109",
    })) as JsonValue;
    assert.equal(recurringTransaction.realizedTransactionCount, 1);
    assert.equal(
      recurringTransaction.latestRealizedTransactionDate,
      "2026-03-15T12:00:00.000Z",
    );

    const recurringSummary = (await getTool(
      "summarize_recurring_commitments",
    ).execute?.({})) as JsonValue;
    assert.equal(recurringSummary.templateCount, 1);
    assert.equal(recurringSummary.estimatedMonthlyTotal, 90);

    await assert.rejects(
      async () =>
        getTool("get_budget").execute?.({
          budgetId: "019cf45e-80f5-714a-a121-bb32f8365114",
        }),
      /not found/i,
    );
  });
});
