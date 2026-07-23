import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/constants";

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-2xs font-semibold",
        STATUS_META[status] ?? STATUS_META["In Review"],
        className,
      )}
    >
      {status}
    </span>
  );
}
