import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "brand" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 ring-slate-300",
    brand: "bg-brand-50 text-brand-700 ring-brand-400/30",
    success: "bg-low-soft text-low-deep ring-low-base/25",
    warning: "bg-medium-soft text-medium-deep ring-medium-base/25",
    danger: "bg-critical-soft text-critical-deep ring-critical-base/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
