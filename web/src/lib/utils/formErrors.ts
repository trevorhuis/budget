/** TanStack Form + Zod 4 may store issues as objects `{ message, path, ... }` instead of strings. */
export function fieldErrorToString(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (error !== null && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }
  return "Invalid value";
}
