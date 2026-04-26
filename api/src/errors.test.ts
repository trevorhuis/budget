import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  AccessDeniedException,
  NotFoundException,
} from "./errors.js";

describe("NotFoundException", () => {
  test("has default message", () => {
    const error = new NotFoundException();
    assert.equal(error.message, "Resource not found");
  });

  test("accepts custom message", () => {
    const error = new NotFoundException("Account not found");
    assert.equal(error.message, "Account not found");
  });

  test("is an instance of Error", () => {
    const error = new NotFoundException();
    assert.ok(error instanceof Error);
  });
});

describe("AccessDeniedException", () => {
  test("has default message", () => {
    const error = new AccessDeniedException();
    assert.equal(error.message, "Access denied");
  });

  test("accepts custom message", () => {
    const error = new AccessDeniedException("You do not own this resource");
    assert.equal(error.message, "You do not own this resource");
  });

  test("is an instance of Error", () => {
    const error = new AccessDeniedException();
    assert.ok(error instanceof Error);
  });
});
