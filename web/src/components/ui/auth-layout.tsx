import { BanknotesIcon } from "@heroicons/react/20/solid";
import type React from "react";

import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_34%),linear-gradient(180deg,_#fbfaf7_0%,_#f3efe7_100%)] px-4 py-10 text-zinc-950 sm:px-6 sm:py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_32%),linear-gradient(180deg,_#171717_0%,_#0a0a0a_100%)] dark:text-white">
      <div className="w-full max-w-md rounded-[2rem] bg-white/88 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10 dark:bg-zinc-950/80">
        <div className="space-y-8">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md ring-1 ring-white/20 dark:ring-white/10">
              <BanknotesIcon className="size-5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              Budget
            </span>
          </div>

          <div className="space-y-3 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              {eyebrow}
            </div>
            <Heading className="text-3xl/10 tracking-tight sm:text-4xl/11">
              {title}
            </Heading>
            <Text className="mx-auto max-w-sm text-sm/6 text-zinc-600 dark:text-zinc-300">
              {description}
            </Text>
          </div>

          {children}

          {footer ? (
            <div className="border-t border-zinc-950/8 pt-6 text-center dark:border-white/10">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
