import { useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { sortCalculatorsByUpdatedAt } from "~/lib/calculators";
import { calculatorCollection } from "~/lib/collections/calculatorCollection";
import type { Calculator } from "~/lib/schemas";

export function useCalculatorScenarios(
  calculatorType?: Calculator["calculatorType"],
) {
  const { data = [] } = useLiveQuery(
    (q) => q.from({ calculator: calculatorCollection }),
    [],
  );

  const scenarios = useMemo(() => {
    const calculators = data ?? [];

    if (!calculatorType) {
      return sortCalculatorsByUpdatedAt(calculators);
    }

    return sortCalculatorsByUpdatedAt(
      calculators.filter((calculator) => calculator.calculatorType === calculatorType),
    );
  }, [calculatorType, data]);

  return {
    scenarios,
    getScenarioById: (scenarioId: string | null) =>
      scenarios.find((scenario) => scenario.id === scenarioId) ?? null,
  };
}

