import type { ReactNode } from "react";

export function CalculatorMetric({
  helper,
  label,
  value,
}: {
  helper?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-950/8 bg-zinc-950/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
        {value}
      </div>
      {helper ? (
        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{helper}</div>
      ) : null}
    </div>
  );
}

export function CalculatorMetricGrid({
  children,
  columnsClassName = "md:grid-cols-4",
}: {
  children: ReactNode;
  columnsClassName?: string;
}) {
  return <div className={`grid gap-4 ${columnsClassName}`}>{children}</div>;
}

