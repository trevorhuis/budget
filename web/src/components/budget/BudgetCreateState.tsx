import { PlusIcon } from "@heroicons/react/20/solid";
import { Button } from "~/components/ui/button";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

type BudgetCreateStateProps = {
  errorMessage: string | null;
  isCreating: boolean;
  monthLabel: string;
  onCreate: () => void;
};

export function BudgetCreateState({
  errorMessage,
  isCreating,
  monthLabel,
  onCreate,
}: BudgetCreateStateProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-dashed border-zinc-950/12 px-6 py-10 dark:border-white/10">
      <div className="space-y-2">
        <Subheading>{monthLabel} has no budget yet</Subheading>
        <Text>
          Create this month’s budget to unlock grouped planning, inline target
          updates, and direct category entry.
        </Text>
      </div>
      {errorMessage ? (
        <Text className="text-rose-600 dark:text-rose-400">{errorMessage}</Text>
      ) : null}
      <Button color="dark/zinc" onClick={onCreate} disabled={isCreating}>
        <PlusIcon data-slot="icon" />
        Create {monthLabel} budget
      </Button>
    </section>
  );
}
