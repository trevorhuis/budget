import {
  LockClosedIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";
import type React from "react";

import { Heading } from "./heading";
import { Text } from "./text";

const featureRows = [
  {
    title: "Session-backed access",
    description: "Every screen and API request resolves from the active user session.",
    icon: LockClosedIcon,
  },
  {
    title: "Private data boundaries",
    description: "Accounts, budgets, transactions, and imports stay scoped to your own user ID.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Fast budget flow",
    description: "Sign in once, then move between planning, imports, and chat without friction.",
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
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(30rem,38rem)]">
        <section className="relative hidden overflow-hidden border-r border-black/6 px-10 py-12 lg:flex lg:flex-col lg:justify-between dark:border-white/8">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 size-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-300/35 blur-3xl dark:bg-emerald-500/20" />
            <div className="absolute right-0 bottom-0 size-96 translate-x-1/4 translate-y-1/4 rounded-full bg-amber-200/55 blur-3xl dark:bg-amber-400/10" />
            <div className="absolute inset-y-12 left-12 right-20 rounded-[2rem] border border-white/60 bg-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/3" />
          </div>

          <div className="relative z-10 max-w-xl space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-zinc-950/10 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-zinc-200">
                Budget workspace
              </div>
              <Heading className="max-w-lg text-4xl/11 font-semibold tracking-tight sm:text-5xl/14 dark:text-white">
                Keep the month clear, current, and locked to the right account owner.
              </Heading>
              <Text className="max-w-xl text-base/7 text-zinc-600 dark:text-zinc-300">
                Better Auth protects the workspace edge-to-edge so planning,
                imports, and chat all resolve from the same trusted session.
              </Text>
            </div>

            <div className="space-y-4">
              {featureRows.map(({ description: itemDescription, icon: Icon, title: itemTitle }) => (
                <div
                  key={itemTitle}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 rounded-2xl border border-zinc-950/8 bg-white/65 px-5 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {itemTitle}
                    </div>
                    <Text className="text-sm/6 text-zinc-600 dark:text-zinc-300">
                      {itemDescription}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-950/8 bg-white/70 px-4 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                Auth
              </div>
              <div className="mt-2 text-lg font-semibold">Email + password</div>
            </div>
            <div className="rounded-2xl border border-zinc-950/8 bg-white/70 px-4 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                Sessions
              </div>
              <div className="mt-2 text-lg font-semibold">Validated per request</div>
            </div>
            <div className="rounded-2xl border border-zinc-950/8 bg-white/70 px-4 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                IDs
              </div>
              <div className="mt-2 text-lg font-semibold">UUIDv7 users</div>
            </div>
          </div>
        </section>

        <section className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl rounded-[2rem] border border-zinc-950/8 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-10 dark:border-white/10 dark:bg-zinc-950/75">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                  {eyebrow}
                </div>
                <Heading className="text-3xl/10 tracking-tight sm:text-4xl/11">
                  {title}
                </Heading>
                <Text className="text-sm/6 text-zinc-600 dark:text-zinc-300">
                  {description}
                </Text>
              </div>

              {children}

              {footer ? (
                <div className="border-t border-zinc-950/8 pt-6 dark:border-white/10">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
