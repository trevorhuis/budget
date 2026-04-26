import { Subheading } from "~/components/ui/heading";
import { formatCurrency } from "~/lib/calculators";

function buildLinePath(values: number[]) {
  if (values.length === 0) {
    return "";
  }

  const width = 520;
  const height = 220;
  const max = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x =
        values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function DonutChart({
  segments,
}: {
  segments: Array<{ label: string; value: number; tone: string }>;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const chartSegments = segments.reduce<
    Array<{ label: string; offset: number; strokeLength: number; tone: string }>
  >((items, segment) => {
    const strokeLength = total === 0 ? 0 : (segment.value / total) * circumference;
    const offset = items.at(-1)
      ? items[items.length - 1].offset + items[items.length - 1].strokeLength
      : 0;

    return [...items, { label: segment.label, offset, strokeLength, tone: segment.tone }];
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
      <div className="relative mx-auto size-56">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            className="text-zinc-200 dark:text-white/10"
            fill="none"
          />
          {chartSegments.map((segment) => (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              fill="none"
              strokeDasharray={`${segment.strokeLength} ${circumference}`}
              strokeDashoffset={-segment.offset}
              className={segment.tone}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            First Month
          </div>
          <div className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center justify-between gap-4 border-b border-zinc-950/6 pb-3 text-sm last:border-b-0 dark:border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className={`size-3 rounded-full ${segment.tone}`} />
              <span className="font-medium text-zinc-950 dark:text-white">
                {segment.label}
              </span>
            </div>
            <span className="text-zinc-500 dark:text-zinc-400">
              {formatCurrency(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({
  series,
  title,
}: {
  series: Array<{ label: string; color: string; values: number[] }>;
  title: string;
}) {
  const max = Math.max(...series.flatMap((entry) => entry.values), 1);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Subheading>{title}</Subheading>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {series.map((entry) => (
            <span key={entry.label} className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${entry.color}`} />
              {entry.label}
            </span>
          ))}
        </div>
      </div>
      <svg
        viewBox="0 0 520 220"
        className="h-56 w-full rounded-2xl border border-zinc-950/8 bg-zinc-950/[0.025] p-3 dark:border-white/10 dark:bg-white/[0.04]"
      >
        <line
          x1="0"
          x2="520"
          y1="220"
          y2="220"
          stroke="currentColor"
          className="text-zinc-300 dark:text-white/15"
          strokeWidth="1"
        />
        <line
          x1="0"
          x2="520"
          y1="110"
          y2="110"
          stroke="currentColor"
          className="text-zinc-200 dark:text-white/10"
          strokeWidth="1"
        />
        {series.map((entry) => (
          <path
            key={entry.label}
            d={buildLinePath(entry.values)}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={entry.color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <text x="6" y="18" className="fill-zinc-500 text-[11px] dark:fill-zinc-400">
          {formatCurrency(max)}
        </text>
      </svg>
    </div>
  );
}
