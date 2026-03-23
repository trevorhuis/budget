import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";

import type {
  OnboardingBudgetItemDraft,
  OnboardingPack,
} from "../../lib/onboarding";
import { onboardingBudgetPacks } from "../../lib/onboarding";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "../ui/description-list";
import { Input } from "../ui/input";
import { Subheading } from "../ui/heading";
import { Text } from "../ui/text";

type BudgetSetupStepProps = {
  monthLabel: string;
  coreItems: OnboardingBudgetItemDraft[];
  customItems: OnboardingBudgetItemDraft[];
  packItems: Record<string, OnboardingBudgetItemDraft[]>;
  selectedPackIds: string[];
  selectedCount: number;
  plannedIncome: string;
  plannedExpenses: string;
  error: string | null;
  onTogglePack: (packId: string) => void;
  onUpdateCoreItem: (
    itemId: string,
    field: "name" | "group" | "targetAmount" | "enabled",
    value: string | boolean,
  ) => void;
  onUpdatePackItem: (
    packId: string,
    itemId: string,
    field: "name" | "group" | "targetAmount" | "enabled",
    value: string | boolean,
  ) => void;
  onUpdateCustomItem: (
    itemId: string,
    field: "name" | "group" | "targetAmount" | "enabled",
    value: string | boolean,
  ) => void;
  onAddCustomItem: () => void;
  onRemoveCustomItem: (itemId: string) => void;
};

export function BudgetSetupStep({
  monthLabel,
  coreItems,
  customItems,
  packItems,
  selectedPackIds,
  selectedCount,
  plannedIncome,
  plannedExpenses,
  error,
  onTogglePack,
  onUpdateCoreItem,
  onUpdatePackItem,
  onUpdateCustomItem,
  onAddCustomItem,
  onRemoveCustomItem,
}: BudgetSetupStepProps) {
  const selectedPackItems = onboardingBudgetPacks.flatMap((pack) =>
    selectedPackIds.includes(pack.id) ? (packItems[pack.id] ?? []) : [],
  );
  const sections = groupBudgetItems([
    ...coreItems,
    ...selectedPackItems,
    ...customItems,
  ]);

  return (
    <div className="space-y-10">
      <section className="space-y-5 border-b border-zinc-950/8 pb-8 dark:border-white/10">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Step 1
          </div>
          <Subheading className="text-xl/8 sm:text-lg/8">
            Shape the first budget for {monthLabel}
          </Subheading>
          <Text className="max-w-3xl">
            Start with the common monthly lines, then layer on packs for life
            situations you already know belong in the plan.
          </Text>
        </div>

        <DescriptionList className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
          <DescriptionTerm>Budget items</DescriptionTerm>
          <DescriptionDetails>{selectedCount}</DescriptionDetails>

          <DescriptionTerm>Planned income</DescriptionTerm>
          <DescriptionDetails className="font-medium text-emerald-600 dark:text-emerald-400">
            {plannedIncome}
          </DescriptionDetails>

          <DescriptionTerm>Planned expenses</DescriptionTerm>
          <DescriptionDetails>{plannedExpenses}</DescriptionDetails>
        </DescriptionList>
      </section>

      <section className="space-y-5 border-b border-zinc-950/8 pb-8 dark:border-white/10">
        <div className="space-y-2">
          <Subheading>Packs</Subheading>
          <Text>
            Add only the bundles that belong in this household. The lines stay
            editable after you switch a pack on.
          </Text>
        </div>

        <div className="flex flex-wrap gap-3">
          {onboardingBudgetPacks.map((pack) => {
            const selected = selectedPackIds.includes(pack.id);

            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => onTogglePack(pack.id)}
                className={[
                  "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-left transition",
                  selected
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                    : "border-zinc-950/10 bg-white/80 text-zinc-950 hover:border-zinc-950/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20",
                ].join(" ")}
              >
                <span className="text-sm font-semibold">{pack.name}</span>
                <Badge color={selected ? "zinc" : pack.accent}>
                  {pack.items.length} lines
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {onboardingBudgetPacks.map((pack) => (
            <PackDescription
              key={pack.id}
              pack={pack}
              isSelected={selectedPackIds.includes(pack.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Subheading>Budget lines</Subheading>
            <Text>
              Adjust names, groups, and target amounts now. Uncheck anything
              that should stay out of the first month.
            </Text>
          </div>
          <Button plain onClick={onAddCustomItem}>
            <PlusIcon data-slot="icon" />
            Add custom line
          </Button>
        </div>

        {error ? (
          <Text className="text-rose-600 dark:text-rose-400">{error}</Text>
        ) : null}

        <div className="overflow-hidden rounded-[1.75rem] border border-zinc-950/8 bg-white/75 dark:border-white/10 dark:bg-white/4">
          <div className="hidden grid-cols-[2.75rem_minmax(0,2fr)_minmax(0,1.2fr)_9rem_5rem] gap-4 border-b border-zinc-950/8 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 lg:grid dark:border-white/10 dark:text-zinc-400">
            <div />
            <div>Category</div>
            <div>Group</div>
            <div>Target</div>
            <div />
          </div>

          <div>
            {sections.map((section) => (
              <div
                key={section.group}
                className="border-b border-zinc-950/8 last:border-b-0 dark:border-white/10"
              >
                <div className="flex items-center justify-between gap-3 bg-zinc-950/[0.025] px-5 py-3 dark:bg-white/[0.03]">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    {section.group}
                  </div>
                  <Text>{section.items.length} lines visible</Text>
                </div>
                <div>
                  {section.items.map((item) => (
                    <BudgetLineRow
                      key={item.id}
                      item={item}
                      onChange={
                        customItems.some(
                          (customItem) => customItem.id === item.id,
                        )
                          ? onUpdateCustomItem
                          : coreItems.some(
                                (coreItem) => coreItem.id === item.id,
                              )
                            ? onUpdateCoreItem
                            : (itemId, field, value) => {
                                const selectedPack = selectedPackIds.find(
                                  (packId) =>
                                    (packItems[packId] ?? []).some(
                                      (packItem) => packItem.id === itemId,
                                    ),
                                );

                                if (selectedPack) {
                                  onUpdatePackItem(
                                    selectedPack,
                                    itemId,
                                    field,
                                    value,
                                  );
                                }
                              }
                      }
                      onRemove={
                        item.isCustom
                          ? () => onRemoveCustomItem(item.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PackDescription({
  pack,
  isSelected,
}: {
  pack: OnboardingPack;
  isSelected: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-5 py-4 transition",
        isSelected
          ? "border-zinc-950/15 bg-zinc-950/[0.035] dark:border-white/15 dark:bg-white/[0.06]"
          : "border-zinc-950/8 bg-white/55 dark:border-white/10 dark:bg-white/[0.025]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-medium text-zinc-950 dark:text-white">
            {pack.name}
          </div>
          <Text>{pack.description}</Text>
        </div>
        {isSelected ? <Badge color="emerald">Selected</Badge> : null}
      </div>
    </div>
  );
}

function BudgetLineRow({
  item,
  onChange,
  onRemove,
}: {
  item: OnboardingBudgetItemDraft;
  onChange: (
    itemId: string,
    field: "name" | "group" | "targetAmount" | "enabled",
    value: string | boolean,
  ) => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className={[
        "grid gap-4 px-5 py-4 transition lg:grid-cols-[2.75rem_minmax(0,2fr)_minmax(0,1.2fr)_9rem_5rem]",
        item.enabled ? "" : "opacity-60",
      ].join(" ")}
    >
      <div className="pt-2">
        <Checkbox
          checked={item.enabled}
          onChange={(checked) => onChange(item.id, "enabled", checked)}
          aria-label={`Toggle ${item.name || "budget line"}`}
        />
      </div>

      <div className="space-y-2">
        <Input
          value={item.name}
          onChange={(event) => onChange(item.id, "name", event.target.value)}
          placeholder="Category name"
          aria-label="Budget category name"
        />
        <Text>{item.description}</Text>
      </div>

      <div className="space-y-2">
        <Input
          value={item.group}
          onChange={(event) => onChange(item.id, "group", event.target.value)}
          placeholder="Group"
          aria-label="Budget group"
        />
        <Text>Groups become the section headers in the budget workspace.</Text>
      </div>

      <div className="space-y-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={item.targetAmount}
          onChange={(event) =>
            onChange(item.id, "targetAmount", event.target.value)
          }
          placeholder="0.00"
          aria-label="Target amount"
        />
        <Text>Monthly target</Text>
      </div>

      <div className="flex items-start justify-end pt-1">
        {onRemove ? (
          <Button
            plain
            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
            onClick={onRemove}
          >
            <TrashIcon data-slot="icon" />
            Remove
          </Button>
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>
    </div>
  );
}

function groupBudgetItems(items: OnboardingBudgetItemDraft[]) {
  const groups = new Map<string, OnboardingBudgetItemDraft[]>();

  for (const item of items) {
    const group = item.group.trim() || "Unassigned";
    const existingGroup = groups.get(group);

    if (existingGroup) {
      existingGroup.push(item);
      continue;
    }

    groups.set(group, [item]);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => {
      if (left === "Income") {
        return -1;
      }

      if (right === "Income") {
        return 1;
      }

      return left.localeCompare(right);
    })
    .map(([group, groupedItems]) => ({
      group,
      items: groupedItems,
    }));
}
