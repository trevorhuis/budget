import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";

import type { OnboardingRecurringDraft } from "~/lib/onboarding";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";

type RecurringSetupStepProps = {
  recurringTransactions: OnboardingRecurringDraft[];
  categoryOptions: Array<{
    key: string;
    label: string;
  }>;
  error: string | null;
  onAddRecurring: () => void;
  onUpdateRecurring: (
    recurringId: string,
    field: "merchant" | "amount" | "recurringDate" | "categoryKey" | "notes",
    value: string,
  ) => void;
  onRemoveRecurring: (recurringId: string) => void;
};

export function RecurringSetupStep({
  recurringTransactions,
  categoryOptions,
  error,
  onAddRecurring,
  onUpdateRecurring,
  onRemoveRecurring,
}: RecurringSetupStepProps) {
  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Subheading>Recurring list</Subheading>
            <Text>
              Add rent, subscriptions, payroll, or other repeat activity you
              already know belongs in the system.
            </Text>
          </div>
          <Button
            plain
            onClick={onAddRecurring}
            disabled={categoryOptions.length === 0}
          >
            <PlusIcon data-slot="icon" />
            Add recurring item
          </Button>
        </div>

        {error ? (
          <Text className="text-rose-600 dark:text-rose-400">{error}</Text>
        ) : null}

        {recurringTransactions.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-zinc-950/12 px-6 py-10 dark:border-white/10">
            <Text>
              No recurring templates yet. You can finish onboarding without
              these and add them later from the transactions side.
            </Text>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((recurring) => (
              <div
                key={recurring.id}
                className="rounded-[1.75rem] border border-zinc-950/8 bg-white/75 px-5 py-5 dark:border-white/10 dark:bg-white/4"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_8rem_8rem_minmax(0,1.2fr)_5rem]">
                  <div className="space-y-2">
                    <Input
                      value={recurring.merchant}
                      onChange={(event) =>
                        onUpdateRecurring(
                          recurring.id,
                          "merchant",
                          event.target.value,
                        )
                      }
                      placeholder="Merchant or reminder label"
                      aria-label="Recurring merchant"
                    />
                    <Text>Use something you will recognize at a glance.</Text>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={recurring.amount}
                      onChange={(event) =>
                        onUpdateRecurring(
                          recurring.id,
                          "amount",
                          event.target.value,
                        )
                      }
                      placeholder="0.00"
                      aria-label="Recurring amount"
                    />
                    <Text>Amount</Text>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={recurring.recurringDate}
                      onChange={(event) =>
                        onUpdateRecurring(
                          recurring.id,
                          "recurringDate",
                          event.target.value,
                        )
                      }
                      placeholder="1"
                      aria-label="Recurring day of month"
                    />
                    <Text>Day of month</Text>
                  </div>

                  <div className="space-y-2">
                    <Select
                      value={recurring.categoryKey}
                      onChange={(event) =>
                        onUpdateRecurring(
                          recurring.id,
                          "categoryKey",
                          event.target.value,
                        )
                      }
                      aria-label="Recurring category"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <Text>Attach it to the category it should inform.</Text>
                  </div>

                  <div className="flex items-start justify-end pt-1">
                    <Button
                      plain
                      className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      onClick={() => onRemoveRecurring(recurring.id)}
                    >
                      <TrashIcon data-slot="icon" />
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Textarea
                    value={recurring.notes}
                    onChange={(event) =>
                      onUpdateRecurring(
                        recurring.id,
                        "notes",
                        event.target.value,
                      )
                    }
                    rows={2}
                    placeholder="Optional note or reminder"
                    aria-label="Recurring notes"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
