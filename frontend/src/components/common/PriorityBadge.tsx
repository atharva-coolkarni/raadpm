import { cn } from "@/lib/utils";
import { PRIORITY_META } from "@/lib/constants";
import type { Priority } from "@/types";

export function PriorityBadge({
  priority,
  showLabel = true,
  className,
}: {
  priority: Priority;
  showLabel?: boolean;
  className?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-2xs font-semibold",
        meta.chip,
        className,
      )}
      title={`${priority} — ${meta.label}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {priority}
      {showLabel && <span className="font-medium opacity-80">{meta.label}</span>}
    </span>
  );
}
