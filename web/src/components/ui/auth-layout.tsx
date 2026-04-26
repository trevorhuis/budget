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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(184,134,59,0.12),_transparent_34%),linear-gradient(180deg,_#F7F4EE_0%,_#EDE9DF_100%)] px-4 py-10 text-(--color-ink-900) sm:px-6 sm:py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(212,160,80,0.10),_transparent_32%),linear-gradient(180deg,_#111210_0%,_#0A0A09_100%)]">
      <div className="w-full max-w-md rounded-[2rem] bg-(--color-surface)/95 p-8 shadow-[0_24px_80px_rgba(26,28,34,0.08)] backdrop-blur-xl sm:p-10 dark:bg-(--color-surface)/90 dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="space-y-8">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-(--color-accent) to-(--color-accent-dark) text-white shadow-md ring-1 ring-white/20 dark:ring-white/10">
              <BanknotesIcon className="size-5" aria-hidden />
            </span>
            <span className="font-serif text-base font-normal tracking-tight text-(--color-ink-900)">
              Budget
            </span>
          </div>

          <div className="space-y-3 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-accent)">
              {eyebrow}
            </div>
            <Heading className="text-3xl/10 tracking-tight sm:text-4xl/11">
              {title}
            </Heading>
            <Text className="mx-auto max-w-sm text-sm/6">
              {description}
            </Text>
          </div>

          {children}

          {footer ? (
            <div className="border-t border-(--color-ink-100) pt-6 text-center">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
