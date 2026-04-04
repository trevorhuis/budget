import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";

import { useAuth } from "~/lib/auth";
import { router } from "~/router";

export function AppRouter() {
  const auth = useAuth();

  useEffect(() => {
    void router.invalidate();
  }, [auth.isAuthenticated, auth.isReady, auth.user?.id]);

  return <RouterProvider router={router} context={{ auth }} />;
}
