import { cn } from "@/lib/utils";

function band(value: number) {
  if (value >= 90) return { label: "High confidence", bar: "bg-low-base", text: "text-low-deep" };
  if (value >= 75) return { label: "Good confidence", bar: "bg-brand-600", text: "text-brand-700" };
  if (value >= 60) return { label: "Moderate confidence", bar: "bg-medium-base", text: "text-medium-deep" };
  return { label: "Low confidence — review closely", bar: "bg-critical-base", text: "text-critical-deep" };
}

export function ConfidenceMeter({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = band(value);
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-semibold tabular-nums text-ink",
            size === "md" ? "text-2xl" : "text-sm",
          )}
        >
          {value}%
        </span>
        <span className={cn("text-2xs font-medium", meta.text)}>{meta.label}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", meta.bar)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
