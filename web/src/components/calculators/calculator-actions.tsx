import type { ReactNode } from "react";

import { Button } from "~/components/ui/button";

type ActionItem = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  plain?: boolean;
};

export function CalculatorActionButtons({ items }: { items: ActionItem[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, index) => (
        <Button
          key={index}
          plain={item.plain}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.children}
        </Button>
      ))}
    </div>
  );
}

