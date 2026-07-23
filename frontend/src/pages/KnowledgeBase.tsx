import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Link2, Search } from "lucide-react";
import { useRunbooks } from "@/hooks/queries";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function KnowledgeBase() {
  const [term, setTerm] = useState("");
  const [team, setTeam] = useState("");
  const { data, isLoading, isError, refetch } = useRunbooks({
    q: term || undefined,
    team: team || undefined,
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
        title="Knowledge base"
        description="The runbooks the engine links to when it recommends a next step."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search runbooks"
                className="h-8 w-56 pl-8 text-xs"
              />
            </div>
            <Select value={team} onChange={(event) => setTeam(event.target.value)}>
              <option value="">All teams</option>
              {data?.teams.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[240px]" />
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((runbook, index) => (
            <motion.div
              key={runbook.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 9) * 0.04, duration: 0.24 }}
              whileHover={{ y: -2 }}
            >
              <Card className="h-full transition-shadow hover:shadow-raised">
                <CardHeader className="flex-col items-start gap-1">
                  <div className="flex w-full items-center gap-2">
                    <span className="font-mono text-2xs text-ink-subtle">{runbook.id}</span>
                    <Badge tone="brand" className="ml-auto">
                      {runbook.owner_team}
                    </Badge>
                  </div>
                  <CardTitle className="leading-snug">{runbook.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-1.5">
                    {runbook.steps.map((step, stepIndex) => (
                      <li key={step} className="flex gap-2 text-xs leading-relaxed text-ink-muted">
                        <span className="font-mono text-2xs text-ink-subtle">
                          {String(stepIndex + 1).padStart(2, "0")}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-2xs text-ink-subtle">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{runbook.estimated_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> {String(runbook.linked_emails ?? 0)} linked
                    </span>
                    <span className="ml-auto">Reviewed {formatDate(runbook.last_reviewed)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No runbooks match"
            description="Try a different keyword such as UPI, audit, backup or phishing."
          />
        </Card>
      )}
    </div>
  );
}
