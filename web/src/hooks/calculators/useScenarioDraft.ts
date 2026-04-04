import type React from "react";
import { useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  buildScenarioUrl,
  type CalculatorDefinition,
  readSearchParam,
} from "~/lib/calculators";
import {
  calculatorCollection,
  createCalculatorScenario,
} from "~/lib/collections/calculatorCollection";
import type { JsonObject } from "~/lib/schemas";
import { useCalculatorScenarioActions } from "~/hooks/calculators/useCalculatorScenarioActions";
import { useCalculatorScenarios } from "~/hooks/calculators/useCalculatorScenarios";

export type ScenarioDraftState<TData extends JsonObject> = {
  activeScenario: ReturnType<typeof useCalculatorScenarios>["scenarios"][number] | null;
  draft: TData;
  duplicateScenario: () => Promise<void>;
  feedback: string | null;
  isWorking: boolean;
  name: string;
  openPdf: () => Promise<void>;
  openScenario: (scenarioId: string) => void;
  removeScenario: () => Promise<void>;
  saveScenario: () => Promise<void>;
  scenarios: ReturnType<typeof useCalculatorScenarios>["scenarios"];
  setDraft: React.Dispatch<React.SetStateAction<TData>>;
  setFeedback: (message: string | null) => void;
  setName: React.Dispatch<React.SetStateAction<string>>;
  shareScenario: () => Promise<void>;
};

export function useScenarioDraft<TData extends JsonObject>(
  definition: CalculatorDefinition<TData>,
): ScenarioDraftState<TData> {
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  });
  const scenarioId = useMemo(
    () => readSearchParam(searchStr, "scenarioId"),
    [searchStr],
  );
  const { scenarios, getScenarioById } = useCalculatorScenarios(definition.type);
  const activeScenario = getScenarioById(scenarioId);
  const actions = useCalculatorScenarioActions();
  const { setFeedback } = actions;
  const sourceKey = `${activeScenario?.id ?? "draft"}:${activeScenario?.updatedAt?.getTime() ?? 0}`;
  const baseName = activeScenario?.name ?? definition.defaultName;
  const baseDraft = activeScenario
    ? definition.parseData(activeScenario.data)
    : definition.defaultData;
  const [localState, setLocalState] = useState(() => ({
    sourceKey,
    name: baseName,
    draft: baseDraft,
  }));
  const name = localState.sourceKey === sourceKey ? localState.name : baseName;
  const draft =
    localState.sourceKey === sourceKey ? localState.draft : baseDraft;

  const resolveCurrentName = (currentState: typeof localState) =>
    currentState.sourceKey === sourceKey ? currentState.name : baseName;

  const resolveCurrentDraft = (currentState: typeof localState) =>
    currentState.sourceKey === sourceKey ? currentState.draft : baseDraft;

  const setName: React.Dispatch<React.SetStateAction<string>> = (value) => {
    setLocalState((current) => ({
      sourceKey,
      draft: resolveCurrentDraft(current),
      name:
        typeof value === "function"
          ? value(resolveCurrentName(current))
          : value,
    }));
  };

  const setDraft: React.Dispatch<React.SetStateAction<TData>> = (value) => {
    setLocalState((current) => ({
      sourceKey,
      name: resolveCurrentName(current),
      draft:
        typeof value === "function"
          ? value(resolveCurrentDraft(current))
          : value,
    }));
  };

  const openScenario = (scenarioIdToOpen: string) => {
    window.location.assign(buildScenarioUrl(definition.path, scenarioIdToOpen));
  };

  const saveScenario = async () => {
    const trimmedName = name.trim() || definition.defaultName;
    setFeedback(null);

    try {
      if (activeScenario) {
        await Promise.resolve(
          calculatorCollection.update(activeScenario.id, (storedScenario) => {
            storedScenario.name = trimmedName;
            storedScenario.calculatorType = definition.type;
            storedScenario.data = draft;
          }),
        );
        setFeedback("Scenario updated.");
      } else {
        const newId = await createCalculatorScenario({
          calculatorType: definition.type,
          data: draft,
          name: trimmedName,
        });
        openScenario(newId);
      }
    } catch {
      setFeedback("Unable to save this scenario right now.");
    }
  };

  const duplicateScenario = async () => {
    if (!activeScenario) {
      setFeedback("Save the scenario before duplicating it.");
      return;
    }

    await actions.duplicateScenario(activeScenario);
  };

  const shareScenario = async () => {
    if (!activeScenario) {
      setFeedback("Save the scenario before creating a share link.");
      return;
    }

    await actions.shareScenario(activeScenario);
  };

  const openPdf = async () => {
    if (!activeScenario) {
      setFeedback("Save the scenario before exporting it.");
      return;
    }

    await actions.openScenarioPdf(activeScenario);
  };

  const removeScenario = async () => {
    if (!activeScenario) {
      return;
    }

    setFeedback(null);

    try {
      await Promise.resolve(calculatorCollection.delete(activeScenario.id));
      window.location.assign(definition.path);
    } catch {
      setFeedback("Unable to delete this scenario.");
    }
  };

  return {
    activeScenario,
    draft,
    duplicateScenario,
    feedback: actions.feedback,
    isWorking: actions.workingId === activeScenario?.id,
    name,
    openPdf,
    openScenario,
    removeScenario,
    saveScenario,
    scenarios,
    setDraft,
    setFeedback,
    setName,
    shareScenario,
  };
}
