import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Download, ScrollText, Search, UserCheck } from "lucide-react";
import { useAudit } from "@/hooks/queries";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricTile } from "@/components/common/MetricTile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SkeletonRows } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogs() {
  const [term, setTerm] = useState("");
  const [actorType, setActorType] = useState("");
  const [event, setEvent] = useState("");

  const { data, isLoading, isError, refetch } = useAudit({
    q: term || undefined,
    actor_type: actorType || undefined,
    event: event || undefined,
  });

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const exportCsv = () => {
    if (!data) return;
    const header = "id,timestamp,event,actor,actor_type,entity_id,outcome,detail\n";
    const rows = data.items
      .map((entry) =>
        [
          entry.id,
          entry.timestamp,
          entry.event,
          entry.actor,
          entry.actor_type,
          entry.entity_id,
          entry.outcome,
          `"${entry.detail.replace(/"/g, "'")}"`,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "raadpm-audit-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Audit logs"
        description="Every AI decision and every human override, captured with its reasoning."
        actions={
          <Button variant="secondary" onClick={exportCsv}>
            <Download /> Export evidence
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="Human actions" value={data?.summary.human_actions ?? 0} hint="Approvals, edits, overrides" />
        <MetricTile label="System actions" value={data?.summary.system_actions ?? 0} hint="Analysis, masking, extraction" />
        <MetricTile label="Explainable" value={data?.summary.explainable ?? 0} hint="Events carrying a reason" />
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by event, actor or record id"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select value={actorType} onChange={(e) => setActorType(e.target.value)}>
            <option value="">All actors</option>
            <option value="Human">Human</option>
            <option value="System">System</option>
          </Select>
          <Select value={event} onChange={(e) => setEvent(e.target.value)}>
            <option value="">All events</option>
            {data?.events.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <SkeletonRows rows={10} className="p-4" />
        ) : data?.items.length ? (
          <div className="divide-y divide-line">
            {data.items.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 14) * 0.015 }}
                className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <span
                  className={
                    entry.actor_type === "Human"
                      ? "flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600"
                      : "flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-ink-muted"
                  }
                >
                  {entry.actor_type === "Human" ? (
                    <UserCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {entry.event} <span className="font-normal text-ink-subtle">by {entry.actor}</span>
                  </p>
                  <p className="mt-0.5 truncate text-2xs text-ink-subtle">
                    <Link to={`/emails/${entry.entity_id}`} className="text-brand-600 hover:underline">
                      {entry.entity_id}
                    </Link>{" "}
                    · {entry.detail}
                  </p>
                </div>
                {entry.confidence !== null && (
                  <span className="hidden text-2xs tabular-nums text-ink-subtle lg:block">
                    confidence {entry.confidence}%
                  </span>
                )}
                <Badge tone={entry.outcome === "Success" ? "success" : "neutral"}>{entry.outcome}</Badge>
                <span className="text-2xs tabular-nums text-ink-subtle">
                  {formatDateTime(entry.timestamp)}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="No audit events match"
            description="Clear the filters to see the full immutable trail of decisions."
          />
        )}
      </Card>
    </div>
  );
}
