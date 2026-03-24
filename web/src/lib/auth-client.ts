import { createAuthClient } from "better-auth/react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

const resolveAuthBaseUrl = () => {
  if (apiBaseUrl) {
    return new URL("/api/auth", apiBaseUrl).toString();
  }

  if (typeof window !== "undefined") {
    return new URL("/api/auth", window.location.origin).toString();
  }

  return "http://localhost:3000/api/auth";
};

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = AuthSession["user"];
