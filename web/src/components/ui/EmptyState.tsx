import type { ReactNode } from "react";

import { Text } from "~/components/ui/text";

type EmptyStateProps = {
  children: ReactNode;
  className?: string;
};

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={
        className ??
        "rounded-2xl border border-dashed border-zinc-950/10 px-6 py-10 dark:border-white/10"
      }
    >
      <Text>{children}</Text>
    </div>
  );
}
