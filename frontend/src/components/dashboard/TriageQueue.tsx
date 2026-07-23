import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Dashboard } from "@/types";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { relativeTime } from "@/lib/utils";

export function TriageQueue({ items }: { items: Dashboard["queue"] }) {
  const navigate = useNavigate();

  return (
    <div className="divide-y divide-line">
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04, duration: 0.24 }}
          onClick={() => navigate(`/emails/${item.id}`)}
          className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50"
        >
          <PriorityBadge priority={item.priority} showLabel={false} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{item.subject}</p>
            <p className="mt-0.5 truncate text-2xs text-ink-subtle">
              {item.category} · {item.owner} · SLA {item.sla} · {relativeTime(item.timestamp)}
            </p>
          </div>
          <div className="hidden text-right lg:block">
            <p className="text-xs font-semibold tabular-nums text-ink">{item.risk_score}/100</p>
            <p className="text-2xs text-ink-subtle">risk</p>
          </div>
          <StatusPill status={item.status} className="hidden md:inline-flex" />
          <ChevronRight className="h-4 w-4 text-ink-subtle transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      ))}
    </div>
  );
}
