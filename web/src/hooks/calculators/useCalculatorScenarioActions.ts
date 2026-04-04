import { useState } from "react";

import {
  buildScenarioUrl,
  buildShareUrl,
  copyToClipboard,
  getCalculatorDefinition,
} from "~/lib/calculators";
import {
  duplicateCalculatorScenario,
  shareCalculatorScenario,
} from "~/lib/collections/calculatorCollection";
import type { Calculator } from "~/lib/schemas";

export function useCalculatorScenarioActions() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const openScenario = (calculator: Pick<Calculator, "id" | "calculatorType">) => {
    const definition = getCalculatorDefinition(calculator.calculatorType);
    window.location.assign(buildScenarioUrl(definition.path, calculator.id));
  };

  const duplicateScenario = async (calculator: Calculator) => {
    setWorkingId(calculator.id);
    setFeedback(null);

    try {
      const duplicated = await duplicateCalculatorScenario(calculator.id);
      openScenario(duplicated);
      return duplicated;
    } catch {
      setFeedback("Unable to duplicate this scenario.");
      return null;
    } finally {
      setWorkingId(null);
    }
  };

  const shareScenario = async (calculator: Calculator) => {
    setWorkingId(calculator.id);
    setFeedback(null);

    try {
      const shareToken =
        calculator.shareToken ?? (await shareCalculatorScenario(calculator.id));
      await copyToClipboard(buildShareUrl(shareToken));
      setFeedback("Share link copied.");
      return shareToken;
    } catch {
      setFeedback("Unable to create a share link.");
      return null;
    } finally {
      setWorkingId(null);
    }
  };

  const openScenarioPdf = async (calculator: Calculator) => {
    setWorkingId(calculator.id);
    setFeedback(null);

    try {
      const shareToken =
        calculator.shareToken ?? (await shareCalculatorScenario(calculator.id));
      window.open(`${buildShareUrl(shareToken)}?print=1`, "_blank", "noopener,noreferrer");
      return shareToken;
    } catch {
      setFeedback("Unable to open the printable report.");
      return null;
    } finally {
      setWorkingId(null);
    }
  };

  return {
    duplicateScenario,
    feedback,
    openScenario,
    openScenarioPdf,
    setFeedback,
    shareScenario,
    workingId,
  };
}

