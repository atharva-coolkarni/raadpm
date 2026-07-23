import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { useTasks } from "@/hooks/queries";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricTile } from "@/components/common/MetricTile";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { SkeletonRows } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils";
import type { Task } from "@/types";

const STATUS_TABS = ["All", "Open", "In Progress", "Blocked", "Awaiting Approval", "Done"];
const NEXT_STATUS: Record<string, Task["status"]> = {
  Open: "In Progress",
  "In Progress": "Done",
  Blocked: "In Progress",
  "Awaiting Approval": "Done",
  Done: "Open",
};

export default function Tasks() {
  const [tab, setTab] = useState("All");
  const [priority, setPriority] = useState("");
  const queryClient = useQueryClient();

  const params = {
    status: tab === "All" ? undefined : tab,
    priority: priority || undefined,
  };
  const { data, isLoading, isError, refetch } = useTasks(params);

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateTask(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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

  return (
    <div className="p-6">
      <PageHeader
        title="Actions"
        description="Every action the engine extracted from the mailbox, with an accountable owner and a clock."
        actions={
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="">All priorities</option>
            <option value="P1">P1 Critical</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Medium</option>
            <option value="P4">P4 Low</option>
          </Select>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricTile label="Open" value={data?.summary.open ?? 0} />
        <MetricTile label="In progress" value={data?.summary.in_progress ?? 0} />
        <MetricTile label="Blocked" value={data?.summary.blocked ?? 0} />
        <MetricTile label="Awaiting approval" value={data?.summary.awaiting_approval ?? 0} />
        <MetricTile label="Done" value={data?.summary.done ?? 0} />
        <MetricTile label="Overdue" value={data?.summary.overdue ?? 0} hint="Past the SLA clock" />
      </div>

      <Card className="mt-4 overflow-hidden">
        <Tabs
          className="px-3"
          value={tab}
          onChange={setTab}
          items={STATUS_TABS.map((value) => ({ value, label: value }))}
        />

        {isLoading ? (
          <SkeletonRows rows={8} className="p-4" />
        ) : data?.items.length ? (
          <div className="divide-y divide-line">
            {data.items.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 12) * 0.02 }}
                className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <PriorityBadge priority={task.priority} showLabel={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{task.title}</p>
                  <p className="mt-0.5 truncate text-2xs text-ink-subtle">
                    <Link to={`/emails/${task.email_id}`} className="text-brand-600 hover:underline">
                      {task.email_id}
                    </Link>{" "}
                    · {task.email_subject}
                  </p>
                </div>
                <div className="hidden text-right lg:block">
                  <p className="text-xs text-ink">{task.owner}</p>
                  <p className="text-2xs text-ink-subtle">{task.team}</p>
                </div>
                <div className="hidden text-right md:block">
                  <p
                    className={
                      task.overdue
                        ? "text-xs font-semibold text-critical-deep"
                        : "text-xs text-ink-muted"
                    }
                  >
                    {formatDateTime(task.due)}
                  </p>
                  <p className="text-2xs text-ink-subtle">
                    {task.overdue ? "Overdue" : `SLA ${task.sla}`}
                  </p>
                </div>
                <StatusPill status={task.status} />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => advance.mutate({ id: task.id, status: NEXT_STATUS[task.status] })}
                  disabled={advance.isPending}
                >
                  {task.status === "Done" ? <Clock3 /> : <CheckCircle2 />}
                  {task.status === "Done" ? "Reopen" : `Move to ${NEXT_STATUS[task.status]}`}
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No actions in this view"
            description="Switch tabs or clear the priority filter to see the rest of the action list."
          />
        )}
      </Card>
    </div>
  );
}
