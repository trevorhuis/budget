import { motion } from "motion/react";
import type { ReactNode } from "react";

type OnboardingShellProps = {
  aside: ReactNode;
  children: ReactNode;
};

export function OnboardingShell({ aside, children }: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#fffdf7_0%,_#ffffff_40%,_#f6f6f4_100%)] text-zinc-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(180deg,_#171717_0%,_#111111_45%,_#09090b_100%)] dark:text-white">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-10 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] lg:gap-0 lg:px-10 lg:py-0">
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-6 border-b border-zinc-950/8 pb-8 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0 lg:py-8 lg:pr-10 dark:border-white/10"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-950/10 bg-white/70 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-zinc-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            Budget onboarding
          </div>

          <div className="space-y-6">{aside}</div>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="min-w-0 lg:py-8 lg:pl-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
