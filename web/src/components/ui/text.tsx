import clsx from "clsx";
import { Link } from "~/components/ui/link";

export function Text({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(
        className,
        "text-base/6 text-(--color-ink-500) sm:text-sm/6",
      )}
    />
  );
}

export function TextLink({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        "text-(--color-ink-900) underline decoration-(--color-ink-200) data-hover:decoration-(--color-accent)",
      )}
    />
  );
}

export function Strong({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"strong">) {
  return (
    <strong
      {...props}
      className={clsx(className, "font-medium text-(--color-ink-900)")}
    />
  );
}

export function Code({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        "rounded-sm border border-(--color-ink-100) bg-(--color-surface-dim) px-0.5 font-mono text-sm font-medium text-(--color-ink-900) sm:text-[0.8125rem]",
      )}
    />
  );
}
