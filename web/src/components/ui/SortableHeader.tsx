import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

type SortableHeaderProps = {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
};

export function SortableHeader({ column, label }: SortableHeaderProps) {
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="inline-flex items-center gap-1.5 text-left"
    >
      <span>{label}</span>
      <ChevronUpDownIcon className="size-4 text-zinc-400" />
    </button>
  );
}
