import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell";
import { resolveAuthSession } from "../lib/auth";
import { getNeedsOnboarding } from "../lib/onboarding";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const session = await resolveAuthSession(context.auth);

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    const needsOnboarding = await getNeedsOnboarding();

    if (needsOnboarding) {
      throw redirect({
        to: "/onboarding",
      });
    }
  },
  component: AppShell,
});
