import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, EyeOff, FileText, ListChecks, Sparkles } from "lucide-react";
import { useEmail } from "@/hooks/queries";
import { api } from "@/lib/api";
import { AnalysisPanel } from "@/components/email/AnalysisPanel";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

const STATUSES = ["New", "In Review", "Awaiting Approval", "In Progress", "Resolved", "Closed"];

export default function EmailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState("masked");
  const { data: email, isLoading, isError, refetch } = useEmail(id);

  const changeStatus = useMutation({
    mutationFn: (status: string) => api.updateEmailStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email", id] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !email) {
    return (
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3 pb-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft /> Back
        </Button>
        <span className="font-mono text-2xs text-ink-subtle">{email.id}</span>
        <PriorityBadge priority={email.priority} />
        <StatusPill status={email.status} />
        {email.sla_at_risk && <Badge tone="danger">SLA at risk</Badge>}
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-2xs font-medium text-ink-subtle">
            Status
            <Select
              value={email.status}
              onChange={(event) => changeStatus.mutate(event.target.value)}
              disabled={changeStatus.isPending}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </label>
          <Link to="/tasks">
            <Button variant="secondary" size="sm">
              <ListChecks /> View actions
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-col items-start gap-2">
              <CardTitle className="text-base leading-snug">{email.subject}</CardTitle>
              <p className="text-2xs text-ink-subtle">
                {email.sender} &lt;{email.sender_email}&gt; · {formatDateTime(email.timestamp)} ·{" "}
                {email.department}
              </p>
              <Tabs
                className="w-full"
                value={view}
                onChange={setView}
                items={[
                  { value: "masked", label: "Masked email" },
                  { value: "original", label: "Original email" },
                ]}
              />
            </CardHeader>
            <CardContent>
              {view === "masked" && (
                <p className="mb-3 flex items-center gap-1.5 rounded-md border border-low-base/20 bg-low-soft px-3 py-2 text-2xs font-medium text-low-deep">
                  <EyeOff className="h-3.5 w-3.5" />
                  Customer and staff identifiers are masked before the message reaches any model.
                </p>
              )}
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                {view === "masked" ? email.masked_body : email.body}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Linked actions
              </CardTitle>
              <span className="text-2xs text-ink-subtle">{email.tasks.length} tracked</span>
            </CardHeader>
            {email.tasks.length ? (
              <div className="divide-y divide-line">
                {email.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="font-mono text-2xs text-ink-subtle">{task.id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{task.title}</span>
                    <span className="text-2xs text-ink-subtle">{task.owner}</span>
                    <StatusPill status={task.status} />
                  </div>
                ))}
              </div>
            ) : (
              <CardContent>
                <p className="text-sm text-ink-muted">
                  No task has been raised yet. Approve the draft response to create one from the
                  extracted actions.
                </p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-brand-600" /> Message metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                ["Category", email.category],
                ["Intent", email.intent],
                ["Owner", email.owner],
                ["Recommended team", email.recommended_team],
                ["Suggested SLA", email.sla],
                ["Runbook", email.runbook],
                ["Duplicates merged", String(email.duplicate_count)],
                ["Attachments", String(email.attachments)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="label-caps">{label}</p>
                  <p className="mt-0.5 text-sm text-ink">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-0 overflow-hidden">
          <AnalysisPanel email={email} />
        </Card>
      </div>
    </div>
  );
}
