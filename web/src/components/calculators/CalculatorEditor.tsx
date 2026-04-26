import type { ReactNode } from "react";

import { FieldGroup, Fieldset } from "~/components/ui/fieldset";
import { Subheading } from "~/components/ui/heading";
import { CalculatorSurface } from "~/components/calculators/CalculatorSurface";

export function CalculatorInputSection({ children }: { children: ReactNode }) {
  return (
    <CalculatorSurface>
      <Subheading>Inputs</Subheading>
      <Fieldset className="mt-5">
        <FieldGroup>{children}</FieldGroup>
      </Fieldset>
    </CalculatorSurface>
  );
}

export function CalculatorResultsColumn({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

