import { cn } from "@/lib/utils";

export function MetricTile({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-line bg-elevated px-3.5 py-3", className)}>
      <p className="label-caps">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-2xs text-ink-subtle">{hint}</p>}
    </div>
  );
}
