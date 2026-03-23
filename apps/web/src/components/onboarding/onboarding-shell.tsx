import { motion } from "motion/react";
import type { ReactNode } from "react";

import { Text } from "../ui/text";

type OnboardingShellProps = {
  monthLabel: string;
  currentStep: number;
  steps: Array<{
    id: number;
    label: string;
    description: string;
  }>;
  aside: ReactNode;
  children: ReactNode;
};

export function OnboardingShell({
  monthLabel,
  currentStep,
  steps,
  aside,
  children,
}: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#fffdf7_0%,_#ffffff_40%,_#f6f6f4_100%)] text-zinc-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(180deg,_#171717_0%,_#111111_45%,_#09090b_100%)] dark:text-white">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-10 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] lg:px-10 lg:py-8">
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col justify-between gap-10 border-b border-zinc-950/8 pb-8 lg:sticky lg:top-0 lg:min-h-[calc(100svh-4rem)] lg:border-r lg:border-b-0 lg:pb-0 lg:pr-10 dark:border-white/10"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-950/10 bg-white/70 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-zinc-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                Budget onboarding
              </div>
              <div className="space-y-3">
                <h1 className="max-w-sm text-4xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-5xl dark:text-white">
                  Build the first month around {monthLabel}.
                </h1>
                <Text className="max-w-md text-base text-zinc-600 dark:text-zinc-300">
                  Start with a practical budget skeleton, add the accounts you
                  watch every week, then capture recurring commitments before
                  the workspace opens up.
                </Text>
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isComplete = step.id < currentStep;

                return (
                  <div
                    key={step.id}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 py-2"
                  >
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
                        isActive
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                          : isComplete
                            ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-300"
                            : "border-zinc-950/10 bg-white/70 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400",
                      ].join(" ")}
                    >
                      {step.id}
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {step.label}
                      </div>
                      <Text className="max-w-sm">{step.description}</Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">{aside}</div>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="min-w-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
