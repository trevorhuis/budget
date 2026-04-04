import { Field, Label } from "~/components/ui/fieldset";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

type BudgetHeaderProps = {
  monthLabel: string;
  selectedMonthValue: string;
  onSelectedMonthValueChange: (value: string) => void;
};

export function BudgetHeader({
  monthLabel,
  selectedMonthValue,
  onSelectedMonthValueChange,
}: BudgetHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-3 rounded-full border border-zinc-950/10 bg-zinc-950/[0.03] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
          Budget workspace
          <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[0.62rem] tracking-[0.18em] text-white dark:bg-white dark:text-zinc-950">
            {monthLabel}
          </span>
        </div>
        <div className="space-y-3">
          <Heading className="text-4xl/none tracking-tight text-zinc-950 sm:text-5xl/none dark:text-white">
            Monthly budget
          </Heading>
          <div className="h-px w-24 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent dark:from-white dark:via-white/40" />
        </div>
        <Text className="max-w-2xl">
          Review one month at a time, watch category pressure early, and tune
          plan targets without leaving the page.
        </Text>
      </div>

      <div className="w-full max-w-xs">
        <Field>
          <Label>Month</Label>
          <Input
            type="month"
            value={selectedMonthValue}
            onChange={(event) => onSelectedMonthValueChange(event.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
