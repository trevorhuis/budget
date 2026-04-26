import clsx from "clsx";
import type { ReactNode } from "react";

type SummaryMetricProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function SummaryMetric({ label, children, className }: SummaryMetricProps) {
  return (
    <div className="min-w-0">
      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div
        className={clsx(
          "mt-0.5 truncate text-sm font-semibold tabular-nums text-zinc-950 dark:text-white",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
