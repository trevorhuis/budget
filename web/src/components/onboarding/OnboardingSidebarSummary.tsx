import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";

type SidebarMetric = {
  label: string;
  value: string;
  emphasize?: boolean;
};

type OnboardingSidebarSummaryProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: SidebarMetric[];
  selectedPacks: Array<{
    id: string;
    name: string;
    accent: "amber" | "emerald" | "sky" | "rose";
  }>;
};

export function OnboardingSidebarSummary({
  eyebrow,
  title,
  description,
  metrics,
  selectedPacks,
}: OnboardingSidebarSummaryProps) {
  return (
    <section className="rounded-[1.9rem] border border-zinc-950/8 bg-white/70 px-5 py-6 shadow-[0_18px_60px_-38px_rgba(24,24,27,0.28)] backdrop-blur dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            {eyebrow}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              {title}
            </h2>
            <Text className="text-zinc-600 dark:text-zinc-300">
              {description}
            </Text>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-zinc-950/8 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={[
                "flex items-center justify-between gap-4 px-4 py-3.5",
                index === 0
                  ? ""
                  : "border-t border-zinc-950/8 dark:border-white/10",
              ].join(" ")}
            >
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {metric.label}
              </div>
              <div
                className={[
                  "text-sm font-medium text-zinc-950 dark:text-white",
                  metric.emphasize
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "",
                ].join(" ")}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Included packs
          </div>
          {selectedPacks.length === 0 ? (
            <Text>Base plan only right now.</Text>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedPacks.map((pack) => (
                <Badge key={pack.id} color={pack.accent}>
                  {pack.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
