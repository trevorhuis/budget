/* eslint-disable react-refresh/only-export-components */

import {
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import type { AuthContextValue } from "~/lib/auth";

type RouterContext = {
  auth: AuthContextValue;
};

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((module) => ({
        default: module.TanStackRouterDevtools,
      })),
    )
  : null;

function RootComponent() {
  return (
    <>
      <Outlet />
      {TanStackRouterDevtools ? (
        <Suspense fallback={null}>
          <TanStackRouterDevtools />
        </Suspense>
      ) : null}
    </>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
