import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { authClient, type AuthSession, type AuthUser } from "~/lib/auth-client";
import { queryClient } from "~/lib/integrations/queryClient";

export type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  ensureSession: () => Promise<AuthSession | null>;
  refetch: () => Promise<AuthSession | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_REDIRECT_PATH = "/budget";

export const sanitizeRedirect = (value: unknown) => {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return DEFAULT_REDIRECT_PATH;
  }

  return value;
};

export const getAbsoluteCallbackURL = (path: string) => {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
};

export const resolveAuthSession = async (auth: AuthContextValue) => {
  if (auth.isReady) {
    return auth.session;
  }

  return auth.ensureSession();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionState = authClient.useSession();
  const session = sessionState.data ?? null;
  const user = session?.user ?? null;

  const ensureSession = async () => {
    if (sessionState.data) {
      return sessionState.data;
    }

    if (!sessionState.isPending) {
      return null;
    }

    const result = await authClient.getSession();
    return result.data ?? null;
  };

  const refetch = async () => {
    const result = await authClient.getSession();
    await sessionState.refetch();
    return result.data ?? null;
  };

  const signOut = async () => {
    const result = await authClient.signOut();

    if (result.error) {
      throw new Error(result.error.message ?? "Unable to sign out.");
    }

    queryClient.clear();
    await sessionState.refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated: session !== null,
        isReady: !sessionState.isPending,
        ensureSession,
        refetch,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
