import {
  LockClosedIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";
import type React from "react";

import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

const featureRows = [
  {
    title: "Session-backed access",
    description:
      "Every screen and API request resolves from the active user session.",
    icon: LockClosedIcon,
  },
  {
    title: "Private data boundaries",
    description:
      "Accounts, budgets, transactions, and imports stay scoped to your own user ID.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Fast budget flow",
    description:
      "Sign in once, then move between planning, imports, and chat without friction.",
    icon: RectangleStackIcon,
  },
] as const;

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthLayout({
  children,
  description,
  eyebrow,
  footer,
  title,
}: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_34%),linear-gradient(180deg,_#fbfaf7_0%,_#f3efe7_100%)] text-zinc-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_32%),linear-gradient(180deg,_#171717_0%,_#0a0a0a_100%)] dark:text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-[92rem] items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <section className="relative w-full overflow-hidden rounded-[2.25rem] bg-white/50 shadow-[0_28px_110px_rgba(15,23,42,0.1)] backdrop-blur-md dark:bg-white/4">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 size-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-300/35 blur-3xl dark:bg-emerald-500/20" />
            <div className="absolute right-0 top-1/2 size-[28rem] -translate-y-1/2 translate-x-1/4 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-400/10" />
            <div className="absolute right-0 bottom-0 size-96 translate-x-1/4 translate-y-1/4 rounded-full bg-amber-200/55 blur-3xl dark:bg-amber-400/10" />
            <div className="absolute inset-x-6 inset-y-6 rounded-[2rem] border border-white/60 bg-white/35 dark:border-white/8 dark:bg-white/2" />
          </div>

          <div className="relative z-10 flex min-h-[calc(100dvh-3rem)] flex-col justify-between gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[46rem] lg:px-10 lg:py-10">
            <div className="flex w-full flex-1 justify-center lg:justify-center">
              <div className="w-full max-w-xl rounded-[2rem] border border-zinc-950/8 bg-white/82 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-10 dark:border-white/10 dark:bg-zinc-950/78">
                <div className="space-y-8">
                  <div className="space-y-3 text-center lg:text-left">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                      {eyebrow}
                    </div>
                    <Heading className="text-3xl/10 tracking-tight sm:text-4xl/11">
                      {title}
                    </Heading>
                    <Text className="mx-auto max-w-lg text-sm/6 text-zinc-600 dark:text-zinc-300 lg:mx-0">
                      {description}
                    </Text>
                  </div>

                  {children}

                  {footer ? (
                    <div className="border-t border-zinc-950/8 pt-6 text-center lg:text-left dark:border-white/10">
                      {footer}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
