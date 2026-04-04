import { PlusIcon, Squares2X2Icon } from "@heroicons/react/20/solid";

import { Button } from "~/components/ui/button";

type BudgetQuickAddStripProps = {
  canAddBudgetItem: boolean;
  onAddBudgetItem: () => void;
  onAddCategory: () => void;
};

/** Repeated entry points after a long list so users don’t scroll back to the header. */
export function BudgetQuickAddStrip({
  canAddBudgetItem,
  onAddBudgetItem,
  onAddCategory,
}: BudgetQuickAddStripProps) {
  return (
    <div className="flex flex-col items-center gap-4 border-t border-dashed border-zinc-950/12 pt-12 dark:border-white/10">
      <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">
        Keep building
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button outline onClick={onAddCategory}>
          <PlusIcon data-slot="icon" />
          Category
        </Button>
        <Button
          color="dark/zinc"
          onClick={onAddBudgetItem}
          disabled={!canAddBudgetItem}
          title={
            !canAddBudgetItem
              ? "No unused categories left for this month—add a new category first."
              : undefined
          }
        >
          <Squares2X2Icon data-slot="icon" />
          Budget item
        </Button>
      </div>
    </div>
  );
}
