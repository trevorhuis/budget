import { Field, Label } from "~/components/ui/fieldset";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";

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
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-1">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-(--color-ink-500)">
          Planning
          <span className="mx-2 font-normal text-(--color-ink-200)">
            ·
          </span>
          <span className="text-(--color-ink-700)">{monthLabel}</span>
        </p>
        <Heading
          level={1}
          className="!text-xl/none tracking-tight sm:!text-2xl/none"
        >
          Monthly budget
        </Heading>
      </div>

      <div className="w-full shrink-0 sm:w-[11.5rem]">
        <Field>
          <Label className="text-xs">Month</Label>
          <Input
            type="month"
            value={selectedMonthValue}
            onChange={(event) => onSelectedMonthValueChange(event.target.value)}
            className="text-sm"
          />
        </Field>
      </div>
    </header>
  );
}
