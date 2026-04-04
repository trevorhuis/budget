import {
  ArrowRightIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import { motion } from "motion/react";

import { Button } from "~/components/ui/button";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

type BudgetEmptyStateProps = {
  monthLabel: string;
  hasAvailableCategories: boolean;
  onAddCategory: () => void;
  onAddBudgetItem: () => void;
};

export function BudgetEmptyState({
  monthLabel,
  hasAvailableCategories,
  onAddCategory,
  onAddBudgetItem,
}: BudgetEmptyStateProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <Subheading>This month is still empty</Subheading>
        <Text className="mx-auto max-w-2xl sm:mx-0">
          Add lines in either order—most people create a{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            category
          </span>{" "}
          first, then attach it to {monthLabel} with a target.
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-950/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950/50 sm:min-h-[220px]"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.11),_transparent_55%)] opacity-80 dark:bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.08),_transparent_55%)]"
            aria-hidden
          />
          <div className="relative space-y-3">
            <span className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-semibold tabular-nums tracking-widest text-emerald-700 dark:text-emerald-400">
              <span className="text-zinc-400 dark:text-zinc-500">01</span>
              <ArrowRightIcon className="size-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
            </span>
            <Subheading className="text-lg/7">New category</Subheading>
            <Text className="text-sm/6 text-zinc-600 dark:text-zinc-400">
              Name, group, and initial target. It appears on {monthLabel}{" "}
              immediately so you can keep planning.
            </Text>
          </div>
          <Button
            color="emerald"
            className="relative w-full justify-center sm:w-auto"
            onClick={onAddCategory}
          >
            <PlusIcon data-slot="icon" />
            Add category
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
          className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-950/10 bg-zinc-950/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03] sm:min-h-[220px]"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(24,24,27,0.06),_transparent_50%)] dark:bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.04),_transparent_50%)]"
            aria-hidden
          />
          <div className="relative space-y-3">
            <span className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-semibold tabular-nums tracking-widest text-zinc-500 dark:text-zinc-400">
              <span className="text-zinc-400 dark:text-zinc-600">02</span>
              <ArrowRightIcon className="size-3.5 text-zinc-400 dark:text-zinc-500" />
            </span>
            <Subheading className="text-lg/7">Budget line</Subheading>
            <Text className="text-sm/6 text-zinc-600 dark:text-zinc-400">
              {hasAvailableCategories
                ? `Pick a category that isn’t on ${monthLabel} yet and set this month’s target.`
                : `Once you have a category that isn’t already on ${monthLabel}, you can add it here with a target.`}
            </Text>
          </div>
          <Button
            color="dark/zinc"
            className="relative w-full justify-center sm:w-auto"
            onClick={onAddBudgetItem}
            disabled={!hasAvailableCategories}
            title={
              !hasAvailableCategories
                ? "Create a category first, or use one that is not already on this month."
                : undefined
            }
          >
            <Squares2X2Icon data-slot="icon" />
            Add budget item
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
