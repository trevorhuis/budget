/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CalculatorReportHero, ReadOnlyCalculatorReport } from "~/components/calculators/CalculatorReport";
import { CalculatorNotice } from "~/components/calculators/CalculatorStates";
import {
  fetchSharedCalculator,
  normalizeCalculator,
} from "~/lib/api/calculators";
import type { Calculator } from "~/lib/schemas";

export const Route = createFileRoute("/shared/calculators/$shareToken")({
  component: SharedCalculatorReportRouteComponent,
});

function SharedCalculatorReportRouteComponent() {
  const { shareToken } = Route.useParams();
  const [calculator, setCalculator] = useState<Calculator | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchSharedCalculator(shareToken)
      .then((response) => {
        if (!active) {
          return;
        }

        setCalculator(normalizeCalculator(response.data));
      })
      .catch(() => {
        if (active) {
          setError("This shared scenario is unavailable.");
        }
      });

    return () => {
      active = false;
    };
  }, [shareToken]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("print") === "1" && calculator) {
      window.setTimeout(() => window.print(), 200);
    }
  }, [calculator]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <CalculatorNotice
          badgeColor="rose"
          badgeLabel="Unavailable"
          title="Shared Scenario Missing"
          description={error}
        />
      </div>
    );
  }

  if (!calculator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <CalculatorNotice
          badgeColor="sky"
          badgeLabel="Loading"
          title="Preparing Shared Report"
          description="Loading the saved calculator scenario."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CalculatorReportHero calculator={calculator} />
      <div className="mt-8">
        <ReadOnlyCalculatorReport calculator={calculator} />
      </div>
    </div>
  );
}
