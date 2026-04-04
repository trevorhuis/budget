import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

type BudgetEmptyStateProps = {
  monthLabel: string;
};

export function BudgetEmptyState({ monthLabel }: BudgetEmptyStateProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-zinc-950/8 px-6 py-10 dark:border-white/10">
      <Subheading>No budget items yet</Subheading>
      <Text>
        Start by adding an existing category or create a new category directly
        into {monthLabel}.
      </Text>
    </section>
  );
}
