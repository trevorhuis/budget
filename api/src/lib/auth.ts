import { betterAuth, type BetterAuthOptions } from "better-auth";
import { uuidv7 } from "uuidv7";

import { db } from "../db/database.js";
import { env, getAllowedWebOrigins } from "../env.js";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const dynamicBaseURL = {
  allowedHosts: ["localhost:3000", "*.vercel.app"],
  protocol: process.env.NODE_ENV === "development" ? "http" : "https",
} satisfies Exclude<BetterAuthOptions["baseURL"], string | undefined>;

const baseURL: BetterAuthOptions["baseURL"] = env.BETTER_AUTH_URL
  ? normalizeBaseUrl(env.BETTER_AUTH_URL)
  : dynamicBaseURL;

const trustedOrigins = Array.from(
  new Set(
    [
      env.BETTER_AUTH_URL ? new URL(env.BETTER_AUTH_URL).origin : undefined,
      "http://localhost:5173",
      "https://*.vercel.app",
      ...getAllowedWebOrigins(),
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

const authBaseOptions = {
  baseURL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: {
    db,
    type: "postgres",
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
  },
  account: {
    modelName: "authAccounts",
  },
  session: {
    modelName: "authSessions",
  },
  verification: {
    modelName: "authVerifications",
  },
} satisfies Omit<BetterAuthOptions, "advanced">;

export const authSchemaOptions = {
  ...authBaseOptions,
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
} satisfies BetterAuthOptions;

export const authOptions = {
  ...authBaseOptions,
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];
