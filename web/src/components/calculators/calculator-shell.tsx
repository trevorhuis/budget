import {
  ArrowPathRoundedSquareIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  Squares2X2Icon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import type { ReactNode } from "react";

import type { ScenarioDraftState } from "~/hooks/calculators/useScenarioDraft";
import {
  formatCurrency,
  formatDateTime,
  getCalculatorSummary,
  type CalculatorDefinition,
} from "~/lib/calculators";
import type { JsonObject } from "~/lib/schemas";
import { Badge } from "~/components/ui/badge";
import { Field, Label } from "~/components/ui/fieldset";
import { Heading, Subheading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { CalculatorActionButtons } from "~/components/calculators/calculator-actions";
import { CalculatorFeedbackBanner } from "~/components/calculators/calculator-states";
import { CalculatorSurface } from "~/components/calculators/calculator-surface";

export function CalculatorScenarioShell<TData extends JsonObject>({
  children,
  definition,
  scenario,
}: {
  children: ReactNode;
  definition: CalculatorDefinition<TData>;
  scenario: ScenarioDraftState<TData>;
}) {
  return (
    <div className="space-y-8">
      <CalculatorSurface className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(244,244,245,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_34%),linear-gradient(135deg,_rgba(24,24,27,0.94),_rgba(9,9,11,0.92))]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge color="sky">{definition.label}</Badge>
              {scenario.activeScenario ? (
                <Badge color="emerald">Saved</Badge>
              ) : (
                <Badge color="amber">Draft</Badge>
              )}
            </div>
            <Heading className="mt-4">{definition.label} Calculator</Heading>
            <Text className="mt-2 max-w-2xl">{definition.description}</Text>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 xl:text-right">
            <div>Last Modified</div>
            <div className="mt-1 font-medium text-zinc-950 dark:text-white">
              {formatDateTime(scenario.activeScenario?.updatedAt)}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <Field>
            <Label>Scenario Name</Label>
            <Input
              value={scenario.name}
              onChange={(event) => scenario.setName(event.currentTarget.value)}
              placeholder={definition.defaultName}
            />
          </Field>
          <CalculatorActionButtons
            items={[
              {
                disabled: scenario.isWorking,
                onClick: scenario.saveScenario,
                children: (
                  <>
                    <Squares2X2Icon />
                    {scenario.activeScenario ? "Update Scenario" : "Save Scenario"}
                  </>
                ),
              },
              {
                plain: true,
                disabled: scenario.isWorking,
                onClick: scenario.duplicateScenario,
                children: (
                  <>
                    <ArrowPathRoundedSquareIcon />
                    Duplicate
                  </>
                ),
              },
              {
                plain: true,
                disabled: scenario.isWorking,
                onClick: scenario.shareScenario,
                children: (
                  <>
                    <LinkIcon />
                    Share Link
                  </>
                ),
              },
              {
                plain: true,
                disabled: scenario.isWorking,
                onClick: scenario.openPdf,
                children: (
                  <>
                    <DocumentArrowDownIcon />
                    Generate PDF
                  </>
                ),
              },
              ...(scenario.activeScenario
                ? [
                    {
                      plain: true,
                      disabled: scenario.isWorking,
                      onClick: scenario.removeScenario,
                      children: (
                        <>
                          <TrashIcon />
                          Delete
                        </>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
        {scenario.feedback ? <CalculatorFeedbackBanner message={scenario.feedback} /> : null}
      </CalculatorSurface>
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">{children}</div>
      <CalculatorSurface>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Subheading>Recent {definition.label} Scenarios</Subheading>
            <Text className="mt-1">
              Jump between saved what-if cases without leaving this calculator.
            </Text>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {scenario.scenarios.length > 0 ? (
            scenario.scenarios.slice(0, 5).map((savedScenario) => (
              <button
                key={savedScenario.id}
                type="button"
                onClick={() => scenario.openScenario(savedScenario.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  savedScenario.id === scenario.activeScenario?.id
                    ? "border-sky-500/50 bg-sky-500/8"
                    : "border-zinc-950/8 hover:bg-zinc-950/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {savedScenario.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(savedScenario.updatedAt)}
                  </div>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(getCalculatorSummary(savedScenario).monthlyPayment)}
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-950/12 px-4 py-5 text-sm text-zinc-500 dark:border-white/12 dark:text-zinc-400">
              Save your first scenario to build a library of comparisons.
            </div>
          )}
        </div>
      </CalculatorSurface>
    </div>
  );
}
