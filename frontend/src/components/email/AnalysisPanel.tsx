import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarClock,
  EyeOff,
  Gauge,
  Info,
  Plus,
  ShieldAlert,
  Tag,
  UserCircle2,
  X,
} from "lucide-react";
import type { EmailDetail } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { DraftResponseCard } from "./DraftResponseCard";
import { cn, formatDateTime, relativeTime } from "@/lib/utils";

function Field({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: typeof Info;
  tone?: "critical" | "warning" | "success";
}) {
  const toneClass =
    tone === "critical"
      ? "text-critical-deep"
      : tone === "warning"
        ? "text-medium-deep"
        : tone === "success"
          ? "text-low-deep"
          : "text-ink";
  return (
    <div>
      <p className="label-caps flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <div className={cn("mt-1 text-sm font-semibold", toneClass)}>{value}</div>
      {hint && <p className="mt-0.5 text-2xs leading-snug text-ink-subtle">{hint}</p>}
    </div>
  );
}

export function AnalysisPanel({
  email,
  onClose,
  compact = false,
}: {
  email: EmailDetail;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-ink">{email.subject}</h2>
          <p className="mt-0.5 text-2xs text-ink-subtle">
            {email.sender} · {formatDateTime(email.timestamp)} · {email.department}
          </p>
        </div>
        <PriorityBadge priority={email.priority} />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close analysis panel">
            <X />
          </Button>
        )}
      </header>

      <div className="grid gap-5 px-5 py-4 lg:grid-cols-2">
        <section>
          <p className="label-caps">AI summary</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{email.summary}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Intent: {email.intent}. Routed to {email.recommended_team} with a {email.sla} response
            target.
          </p>

          <div className="mt-4">
            <p className="label-caps">Confidence score</p>
            <ConfidenceMeter value={email.confidence} className="mt-1.5" />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2">
            <p className="label-caps">Extracted actions ({email.actions.length})</p>
          </div>
          <ol className="mt-2 space-y-2">
            {email.actions.map((action, index) => (
              <motion.li
                key={action.id}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex items-start gap-2.5 rounded-md border border-line bg-elevated px-3 py-2"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex-1 text-xs leading-relaxed text-ink">{action.label}</span>
                <Badge tone={action.weight === "Primary" ? "brand" : "neutral"}>{action.weight}</Badge>
              </motion.li>
            ))}
          </ol>
          <Button variant="ghost" size="sm" className="mt-2">
            <Plus /> Add extracted action
          </Button>
        </section>
      </div>

      <div className="grid gap-4 border-t border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Category"
          value={email.category}
          hint={`${email.tags.length} tags applied`}
          icon={Tag}
        />
        <Field
          label="Priority score"
          value={
            <span className="flex items-baseline gap-1">
              {email.risk_score}
              <span className="text-2xs font-normal text-ink-subtle">/100</span>
            </span>
          }
          hint={`${email.priority} · ${email.risk} risk`}
          icon={Gauge}
          tone={email.risk_score >= 85 ? "critical" : email.risk_score >= 65 ? "warning" : undefined}
        />
        <Field
          label="Response due"
          value={email.sla}
          hint={`Received ${relativeTime(email.timestamp)}`}
          icon={CalendarClock}
        />
        <Field
          label="Owner (suggested)"
          value={email.owner}
          hint={email.recommended_team}
          icon={UserCircle2}
        />
        <Field
          label="Control impact"
          value={email.human_approval_required ? "Human approval required" : "Auto-eligible"}
          hint={
            email.human_approval_required
              ? "AI cannot send without sign-off"
              : "Confidence above the auto threshold"
          }
          icon={ShieldAlert}
          tone={email.human_approval_required ? "warning" : "success"}
        />
        <Field
          label="Risk level"
          value={email.risk}
          hint={email.sla_at_risk ? "SLA at risk" : "Within SLA"}
          tone={email.risk === "Critical" ? "critical" : email.risk === "High" ? "warning" : undefined}
        />
        <Field
          label="PII masking"
          value={email.pii_masked ? "Applied" : "Nothing detected"}
          hint="Masking runs before any model call"
          icon={EyeOff}
          tone={email.pii_masked ? "success" : undefined}
        />
        <Field label="Source" value="Operational mailbox" hint={email.sender_email} />
      </div>

      <div className="border-t border-line px-5 py-4">
        <p className="label-caps flex items-center gap-1">
          <Info className="h-3 w-3" /> Why this decision
        </p>
        <p className="mt-1.5 rounded-md border border-line bg-elevated p-3 text-xs leading-relaxed text-ink-muted">
          {email.reasoning}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {email.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-brand-50 px-1.5 py-0.5 text-2xs font-medium text-brand-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {email.runbook_detail && (
        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-brand-600" />
            <p className="label-caps text-ink">Suggested runbook</p>
            <Link
              to="/knowledge-base"
              className="ml-auto text-2xs font-semibold text-brand-600 hover:underline"
            >
              Open knowledge base
            </Link>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-ink">
            {email.runbook_detail.id} · {email.runbook_detail.title}
          </p>
          <p className="text-2xs text-ink-subtle">
            {email.runbook_detail.owner_team} · about {email.runbook_detail.estimated_minutes} min
          </p>
          <ol className="mt-2 space-y-1.5">
            {email.runbook_detail.steps.map((step, index) => (
              <li key={step} className="flex gap-2 text-xs text-ink-muted">
                <span className="font-mono text-2xs text-ink-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {!compact && email.related_emails.length > 0 && (
        <div className="border-t border-line px-5 py-4">
          <p className="label-caps">Related incidents and messages</p>
          <div className="mt-2 space-y-1.5">
            {email.related_incidents.map((incident) => (
              <span
                key={incident}
                className="mr-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-2xs text-ink-muted"
              >
                {incident}
              </span>
            ))}
            {email.related_emails.map((related) => (
              <Link
                key={related.id}
                to={`/emails/${related.id}`}
                className="flex items-center gap-2 rounded-md border border-line bg-elevated px-3 py-2 text-xs text-ink hover:border-brand-400"
              >
                <PriorityBadge priority={related.priority} showLabel={false} />
                <span className="flex-1 truncate">{related.subject}</span>
                <span className="text-2xs text-ink-subtle">{related.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <DraftResponseCard emailId={email.id} draft={email.draft_response} approval={email.approval} />
    </div>
  );
}
