import { motion } from "framer-motion";
import {
  AlertOctagon,
  CheckCircle2,
  Clock4,
  Gauge,
  Mail,
  TrendingDown,
  TrendingUp,
  ListChecks,
} from "lucide-react";
import type { Kpi } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Mail> = {
  total_emails: Mail,
  critical_emails: AlertOctagon,
  open_actions: ListChecks,
  sla_at_risk: Clock4,
  risk_score: Gauge,
  auto_resolved: CheckCircle2,
};

const TONES: Record<Kpi["tone"], string> = {
  neutral: "bg-slate-100 text-slate-600",
  critical: "bg-critical-soft text-critical-base",
  warning: "bg-medium-soft text-medium-base",
  info: "bg-info-soft text-info-base",
  success: "bg-low-soft text-low-base",
};

export function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const Icon = ICONS[kpi.key] ?? Mail;
  const Trend = kpi.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="panel flex items-start gap-3 p-4 transition-shadow hover:shadow-raised"
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", TONES[kpi.tone])}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="label-caps truncate">{kpi.label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums leading-none text-ink">{kpi.value}</p>
        <p className="mt-1.5 flex items-center gap-1 text-2xs text-ink-subtle">
          <Trend
            className={cn("h-3 w-3", kpi.trend === "up" ? "text-low-base" : "text-critical-base")}
          />
          {kpi.delta}
        </p>
      </div>
    </motion.div>
  );
}
