import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getAuthenticatedUserId } from "./auth.utils.js";
import { validateString } from "./validator.utils.js";

describe("validateString", () => {
  test("accepts a valid uuidv7 string", async () => {
    const result = await validateString("019cf45e-80f5-714a-a121-bb32f8365101");
    assert.equal(result, "019cf45e-80f5-714a-a121-bb32f8365101");
  });

  test("rejects a non-uuid string", async () => {
    await assert.rejects(async () => {
      await validateString("not-a-uuid");
    });
  });

  test("rejects a valid uuidv4 (non-v7)", async () => {
    await assert.rejects(async () => {
      await validateString("550e8400-e29b-41d4-a716-446655440000");
    });
  });

  test("rejects a number", async () => {
    await assert.rejects(async () => {
      await validateString(12345 as any);
    });
  });

  test("rejects null", async () => {
    await assert.rejects(async () => {
      await validateString(null);
    });
  });

  test("rejects undefined", async () => {
    await assert.rejects(async () => {
      await validateString(undefined);
    });
  });

  test("rejects an object", async () => {
    await assert.rejects(async () => {
      await validateString({} as any);
    });
  });

  test("rejects an array", async () => {
    await assert.rejects(async () => {
      await validateString([] as any);
    });
  });

  test("rejects an empty string", async () => {
    await assert.rejects(async () => {
      await validateString("");
    });
  });
});

describe("getAuthenticatedUserId", () => {
  const validUuid = "019cf45e-80f5-714a-a121-bb32f8365101";

  test("returns the userId when given a valid uuid string", async () => {
    const result = await getAuthenticatedUserId(validUuid);
    assert.equal(result, validUuid);
  });

  test("returns null when given a non-string", async () => {
    const result = await getAuthenticatedUserId(12345 as any);
    assert.equal(result, null);
  });

  test("returns null when given null", async () => {
    const result = await getAuthenticatedUserId(null);
    assert.equal(result, null);
  });

  test("returns null when given undefined", async () => {
    const result = await getAuthenticatedUserId(undefined);
    assert.equal(result, null);
  });

  test("returns null when given an object", async () => {
    const result = await getAuthenticatedUserId({} as any);
    assert.equal(result, null);
  });

  test("returns null when given an invalid uuid string", async () => {
    const result = await getAuthenticatedUserId("not-a-uuid");
    assert.equal(result, null);
  });

  test("returns null when given an empty string", async () => {
    const result = await getAuthenticatedUserId("");
    assert.equal(result, null);
  });
});
