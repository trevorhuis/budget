import { validateString } from "./validator.utils.js";

export const getAuthenticatedUserId = async (
  userId: unknown,
): Promise<string | null> => {
  if (typeof userId !== "string") {
    return null;
  }

  try {
    return await validateString(userId);
  } catch {
    return null;
  }
};
