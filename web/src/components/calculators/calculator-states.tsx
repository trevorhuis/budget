import type React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { CalculatorSurface } from "~/components/calculators/calculator-surface";

export function CalculatorNotice({
  actionHref,
  actionLabel,
  badgeColor,
  badgeLabel,
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  badgeColor: React.ComponentProps<typeof Badge>["color"];
  badgeLabel: string;
  description: string;
  title: string;
}) {
  return (
    <CalculatorSurface>
      <Badge color={badgeColor}>{badgeLabel}</Badge>
      <Heading className="mt-4">{title}</Heading>
      <Text className="mt-2">{description}</Text>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Button href={actionHref}>{actionLabel}</Button>
        </div>
      ) : null}
    </CalculatorSurface>
  );
}

export function CalculatorFeedbackBanner({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-zinc-950/8 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
      {message}
    </div>
  );
}
