import { motion } from "framer-motion";
import {
  AlertTriangle,
  Copy,
  Paperclip,
  ShieldCheck,
  Siren,
  Server,
  CreditCard,
  RefreshCw,
  KeyRound,
  FileText,
  Megaphone,
  Building2,
} from "lucide-react";
import type { Email } from "@/types";
import { PRIORITY_META } from "@/lib/constants";
import { cn, formatTime, initials } from "@/lib/utils";

const CATEGORY_ICON: Record<string, typeof FileText> = {
  "Incident Management": Siren,
  Security: ShieldCheck,
  Payments: CreditCard,
  "Audit & Compliance": FileText,
  "Change Management": RefreshCw,
  Infrastructure: Server,
  "Access Management": KeyRound,
  "Vendor Management": Building2,
  "Core Banking": Server,
  Reporting: Megaphone,
  General: Megaphone,
};

export function EmailListItem({
  email,
  active,
  selected,
  onSelect,
  onToggle,
  index,
}: {
  email: Email;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  index: number;
}) {
  const Icon = CATEGORY_ICON[email.category] ?? FileText;
  const meta = PRIORITY_META[email.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 12) * 0.02 }}
      className={cn(
        "group relative flex gap-3 border-b border-line px-4 py-3 transition-colors",
        active ? "bg-brand-50/70" : "hover:bg-slate-50",
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-600" />}

      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`Select ${email.subject}`}
        className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />

      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
          meta.chip,
        )}
        title={email.category}
      >
        <Icon className="h-4 w-4" />
      </div>

      <button onClick={onSelect} className="min-w-0 flex-1 text-left">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-sm text-ink",
              email.unread ? "font-semibold" : "font-medium",
            )}
          >
            {email.subject}
          </p>
          <span className="shrink-0 text-2xs tabular-nums text-ink-subtle">
            {formatTime(email.timestamp)}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">{email.summary}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-ink-muted">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-300 text-[8px] font-bold text-white">
              {initials(email.sender)}
            </span>
            {email.sender}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-ink-muted">
            {email.category}
          </span>
          <span className={cn("rounded px-1.5 py-0.5 text-2xs font-semibold", meta.chip)}>
            {email.priority} {meta.label}
          </span>
          {email.sla_at_risk && (
            <span className="flex items-center gap-1 rounded bg-critical-soft px-1.5 py-0.5 text-2xs font-semibold text-critical-deep">
              <AlertTriangle className="h-3 w-3" /> SLA {email.sla}
            </span>
          )}
          {email.duplicate_count > 0 && (
            <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-ink-muted">
              <Copy className="h-3 w-3" /> {email.duplicate_count} duplicate
            </span>
          )}
          {email.attachments > 0 && (
            <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-ink-muted">
              <Paperclip className="h-3 w-3" /> {email.attachments}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
}
