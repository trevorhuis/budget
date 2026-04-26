import {
  Bars3Icon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { useStore } from "@tanstack/react-form";
import { type DragEvent, useState } from "react";

import type {
  OnboardingBudgetItemDraft,
  OnboardingPack,
} from "~/lib/onboarding";
import { onboardingBudgetPacks } from "~/lib/onboarding";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { useAppForm } from "~/hooks/form";

type BudgetSetupStepProps = {
  coreItems: OnboardingBudgetItemDraft[];
  customItems: OnboardingBudgetItemDraft[];
  packItems: Record<string, OnboardingBudgetItemDraft[]>;
  selectedPackIds: string[];
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
  onAddCustomItem: (groupName: string) => void;
  onAddGroup: (groupName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItemToGroup: (itemId: string, groupName: string) => void;
};

export function BudgetSetupStep({
  coreItems,
  customItems,
  packItems,
  selectedPackIds,
  error,
  onTogglePack,
  onUpdateCoreItem,
  onUpdatePackItem,
  onUpdateCustomItem,
  onAddCustomItem,
  onAddGroup,
  onDeleteItem,
  onMoveItemToGroup,
}: BudgetSetupStepProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTargetGroup, setDropTargetGroup] = useState<string | null>(null);
  const selectedPackItems = onboardingBudgetPacks.flatMap((pack) =>
    selectedPackIds.includes(pack.id) ? (packItems[pack.id] ?? []) : [],
  );
  const sections = groupBudgetItems([
    ...coreItems,
    ...selectedPackItems,
    ...customItems,
  ].filter((item) => item.enabled));

  const newGroupForm = useAppForm({
    defaultValues: {
      groupName: "",
    },
    onSubmit: ({ value, formApi }) => {
      const groupName = value.groupName.trim();

      if (!groupName) {
        return;
      }

      onAddGroup(groupName);
      formApi.reset({ groupName: "" });
    },
  });

  const canSubmitNewGroup = useStore(
    newGroupForm.store,
    (state) => state.values.groupName.trim().length > 0,
  );

  const handleSectionDragOver = (
    event: DragEvent<HTMLDivElement>,
    groupName: string,
  ) => {
    if (!draggedItemId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dropTargetGroup !== groupName) {
      setDropTargetGroup(groupName);
    }
  };

  const handleSectionDrop = (
    event: DragEvent<HTMLDivElement>,
    groupName: string,
  ) => {
    event.preventDefault();

    const itemId =
      draggedItemId || event.dataTransfer.getData("text/plain") || null;

    if (itemId) {
      onMoveItemToGroup(itemId, groupName);
    }

    setDraggedItemId(null);
    setDropTargetGroup(null);
  };

  return (
    <div className="space-y-10">
      <section className="space-y-5 border-b border-zinc-950/8 pb-8 dark:border-white/10">
        <div className="space-y-2">
          <Subheading>Packs</Subheading>
          <Text>
            Add only the bundles that belong in this household. The lines stay
            editable after you switch a pack on.
          </Text>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {onboardingBudgetPacks.map((pack) => (
            <PackOption
              key={pack.id}
              pack={pack}
              isSelected={selectedPackIds.includes(pack.id)}
              onToggle={() => onTogglePack(pack.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Subheading>Budget lines</Subheading>
            <Text>
              Adjust names and target amounts, drag lines between groups to
              reassign them, and delete anything that should stay out of the
              first month.
            </Text>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void newGroupForm.handleSubmit();
            }}
            className="rounded-[1.5rem] border border-zinc-950/8 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-sm space-y-1">
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Create a new group
                </div>
                <Text>
                  Start a fresh section with one default budget line.
                </Text>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:min-w-[28rem]">
                <newGroupForm.AppField name="groupName">
                  {(field) => (
                    <Input
                      className="sm:flex-1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Subscriptions"
                      aria-label="New budget group name"
                    />
                  )}
                </newGroupForm.AppField>
                <Button
                  type="submit"
                  disabled={!canSubmitNewGroup}
                  className="justify-center whitespace-nowrap sm:min-w-32"
                >
                  <PlusIcon data-slot="icon" />
                  Add group
                </Button>
              </div>
            </div>
          </form>
        </div>

        {error ? (
          <Text className="text-rose-600 dark:text-rose-400">{error}</Text>
        ) : null}

        <div className="overflow-hidden rounded-[1.75rem] border border-zinc-950/8 bg-white/75 dark:border-white/10 dark:bg-white/4">
          <div className="hidden grid-cols-[2rem_minmax(0,1.9fr)_10rem_5.5rem] gap-4 border-b border-zinc-950/8 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 lg:grid dark:border-white/10 dark:text-zinc-400">
            <div />
            <div>Category</div>
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
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {section.group}
                    </div>
                    <Text>{section.items.length} lines visible</Text>
                  </div>
                  {section.groupValue ? (
                    <Button plain onClick={() => onAddCustomItem(section.groupValue)}>
                      <PlusIcon data-slot="icon" />
                      Add line
                    </Button>
                  ) : null}
                </div>
                <div
                  className={
                    dropTargetGroup === section.groupValue
                      ? "bg-sky-500/[0.045] dark:bg-sky-400/[0.08]"
                      : ""
                  }
                  onDragOver={(event) =>
                    section.groupValue
                      ? handleSectionDragOver(event, section.groupValue)
                      : undefined
                  }
                  onDrop={(event) =>
                    section.groupValue
                      ? handleSectionDrop(event, section.groupValue)
                      : undefined
                  }
                >
                  {section.items.map((item) => (
                    <BudgetLineRow
                      key={item.id}
                      item={item}
                      isDragging={draggedItemId === item.id}
                      onDragStart={() => {
                        setDraggedItemId(item.id);
                        setDropTargetGroup(null);
                      }}
                      onDragEnd={() => {
                        setDraggedItemId(null);
                        setDropTargetGroup(null);
                      }}
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
                      onDelete={() => onDeleteItem(item.id)}
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

function PackOption({
  pack,
  isSelected,
  onToggle,
}: {
  pack: OnboardingPack;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={[
        "group rounded-[1.75rem] border px-5 py-4 text-left transition sm:px-6 sm:py-5",
        isSelected
          ? "border-zinc-950/20 bg-zinc-950/[0.04] shadow-[0_12px_30px_-22px_rgba(24,24,27,0.55)] dark:border-white/15 dark:bg-white/[0.06]"
          : "border-zinc-950/8 bg-white/55 shadow-[0_10px_25px_-24px_rgba(24,24,27,0.12)] hover:border-zinc-950/30 hover:bg-zinc-950/[0.045] hover:shadow-[0_20px_45px_-24px_rgba(24,24,27,0.28)] dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/25 dark:hover:bg-white/[0.09] dark:hover:shadow-[0_20px_45px_-24px_rgba(0,0,0,0.45)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="font-medium text-zinc-950 transition group-hover:text-zinc-950 dark:text-white dark:group-hover:text-white">
              {pack.name}
            </div>
            <Badge color={pack.accent} className="transition group-hover:scale-[1.03]">
              {pack.items.length} lines
            </Badge>
          </div>
          <Text className="max-w-[42ch] text-base/8 transition group-hover:text-zinc-700 sm:text-sm/6 dark:group-hover:text-zinc-200">
            {pack.description}
          </Text>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {isSelected ? (
            <Badge color="emerald" className="gap-1.5">
              <CheckIcon className="size-4" />
              Included
            </Badge>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 transition group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-200">
              Add
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function BudgetLineRow({
  item,
  isDragging,
  onDragStart,
  onDragEnd,
  onChange,
  onDelete,
}: {
  item: OnboardingBudgetItemDraft;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onChange: (
    itemId: string,
    field: "name" | "group" | "targetAmount" | "enabled",
    value: string | boolean,
  ) => void;
  onDelete: () => void;
}) {
  const lineForm = useAppForm({
    defaultValues: {
      name: item.name,
      targetAmount: item.targetAmount,
    },
  });

  return (
    <div
      className={[
        "grid gap-4 px-5 py-4 transition lg:grid-cols-[2rem_minmax(0,1.9fr)_10rem_5.5rem]",
        isDragging ? "opacity-50" : "",
      ].join(" ")}
    >
      <div className="flex items-start pt-2">
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.id);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="cursor-grab rounded-md p-1 text-zinc-400 transition hover:bg-zinc-950/5 hover:text-zinc-600 active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
          aria-label={`Drag ${item.name || "budget line"} to another group`}
        >
          <Bars3Icon className="size-5" />
        </button>
      </div>

      <div className="space-y-2">
        <lineForm.AppField name="name">
          {(field) => (
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                const value = event.target.value;
                field.handleChange(value);
                onChange(item.id, "name", value);
              }}
              placeholder="Category name"
              aria-label="Budget category name"
            />
          )}
        </lineForm.AppField>
        <Text>{item.description}</Text>
      </div>

      <div className="space-y-2">
        <lineForm.AppField name="targetAmount">
          {(field) => (
            <Input
              type="number"
              step="0.01"
              min="0"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                const value = event.target.value;
                field.handleChange(value);
                onChange(item.id, "targetAmount", value);
              }}
              placeholder="0.00"
              aria-label="Target amount"
            />
          )}
        </lineForm.AppField>
        <Text>Monthly target</Text>
      </div>

      <div className="flex items-start justify-end pt-1">
        <Button
          plain
          className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
          onClick={onDelete}
        >
          <TrashIcon data-slot="icon" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function groupBudgetItems(items: OnboardingBudgetItemDraft[]) {
  const groups = new Map<string, OnboardingBudgetItemDraft[]>();

  for (const item of items) {
    const group = item.group.trim();
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

      return (left || "Unassigned").localeCompare(right || "Unassigned");
    })
    .map(([group, groupedItems]) => ({
      group: group || "Unassigned",
      groupValue: group,
      items: groupedItems,
    }));
}
