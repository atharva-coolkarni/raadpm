import type { Priority } from "@/types";

export const PRIORITY_META: Record<
  Priority,
  { label: string; short: string; chip: string; dot: string; bar: string }
> = {
  P1: {
    label: "Critical",
    short: "P1",
    chip: "bg-critical-soft text-critical-deep ring-1 ring-inset ring-critical-base/25",
    dot: "bg-critical-base",
    bar: "bg-critical-base",
  },
  P2: {
    label: "High",
    short: "P2",
    chip: "bg-high-soft text-high-deep ring-1 ring-inset ring-high-base/25",
    dot: "bg-high-base",
    bar: "bg-high-base",
  },
  P3: {
    label: "Medium",
    short: "P3",
    chip: "bg-medium-soft text-medium-deep ring-1 ring-inset ring-medium-base/25",
    dot: "bg-medium-base",
    bar: "bg-medium-base",
  },
  P4: {
    label: "Low",
    short: "P4",
    chip: "bg-low-soft text-low-deep ring-1 ring-inset ring-low-base/25",
    dot: "bg-low-base",
    bar: "bg-low-base",
  },
};

export const STATUS_META: Record<string, string> = {
  New: "bg-info-soft text-info-deep ring-1 ring-inset ring-info-base/20",
  "In Review": "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300",
  "Awaiting Approval": "bg-medium-soft text-medium-deep ring-1 ring-inset ring-medium-base/25",
  "In Progress": "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-400/30",
  Blocked: "bg-critical-soft text-critical-deep ring-1 ring-inset ring-critical-base/25",
  Open: "bg-info-soft text-info-deep ring-1 ring-inset ring-info-base/20",
  Done: "bg-low-soft text-low-deep ring-1 ring-inset ring-low-base/25",
  Resolved: "bg-low-soft text-low-deep ring-1 ring-inset ring-low-base/25",
  Closed: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300",
};

export const CHART_COLORS = ["#1D56D6", "#D92D20", "#DC6803", "#067647", "#7E22CE", "#0E7490", "#B54708"];

export const PRIORITY_COLORS: Record<string, string> = {
  P1: "#D92D20",
  P2: "#DC6803",
  P3: "#B54708",
  P4: "#067647",
};

export const CURRENT_USER = {
  name: "App Ops User",
  role: "IT Operations",
  initials: "AO",
};
