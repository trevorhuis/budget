import { createFileRoute, redirect } from "@tanstack/react-router";

import { OnboardingWorkspace } from "../components/onboarding-workspace";
import { getNeedsOnboarding } from "../lib/onboarding";
import { resolveAuthSession } from "../lib/auth";

export const Route = createFileRoute("/onboarding")({
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

    if (!needsOnboarding) {
      throw redirect({ to: "/budget" });
    }
  },
  component: OnboardingWorkspace,
});
