import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url().optional(),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPEN_AI_API_KEY: z.string().optional(),
    OPENAI_BULK_TRANSACTIONS_MODEL: z.string().optional(),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});

export const getAllowedWebOrigins = () => {
  return (env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);
};

export const getOpenAiApiKey = () => {
  const primaryKey = process.env.OPENAI_API_KEY?.trim();
  const legacyKey = process.env.OPEN_AI_API_KEY?.trim();

  if (primaryKey) {
    return primaryKey;
  }

  if (legacyKey) {
    return legacyKey;
  }

  return null;
};
