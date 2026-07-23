import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox as InboxIcon, Maximize2, Search } from "lucide-react";
import { useEmail, useEmails, useFilters } from "@/hooks/queries";
import { EmailListItem } from "@/components/inbox/EmailListItem";
import { InboxToolbar } from "@/components/inbox/InboxToolbar";
import { Pagination } from "@/components/inbox/Pagination";
import { AnalysisPanel } from "@/components/email/AnalysisPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonRows } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmailQuery } from "@/types";

const FOLDER_TITLES: Record<string, string> = {
  "high-priority": "High priority",
  "audit-compliance": "Audit & compliance",
  security: "Security",
  infrastructure: "Infrastructure",
  "change-management": "Change management",
  incidents: "Incidents",
  unread: "Unread",
  flagged: "Flagged",
  "sla-risk": "SLA at risk",
  overdue: "Overdue",
};

export default function Inbox() {
  const { folder } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState<EmailQuery>({ page: 1, page_size: 20, sort: "priority" });
  const [term, setTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const effectiveQuery = useMemo<EmailQuery>(
    () => ({ ...query, folder, q: term.trim() || undefined }),
    [query, folder, term],
  );

  const { data, isLoading, isError, refetch, isFetching } = useEmails(effectiveQuery);
  const { data: filters } = useFilters();
  const { data: active } = useEmail(activeId ?? undefined);

  useEffect(() => {
    setQuery((current) => ({ ...current, page: 1 }));
    setSelected([]);
  }, [folder]);

  useEffect(() => {
    if (!data?.items.length) {
      setActiveId(null);
      return;
    }
    if (!activeId || !data.items.some((email) => email.id === activeId)) {
      setActiveId(data.items[0].id);
    }
  }, [data, activeId]);

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const title = folder ? (FOLDER_TITLES[folder] ?? "Operational inbox") : "Operational inbox";

  return (
    <div className="flex h-full min-h-0 gap-4 p-4">
      <section className="panel flex min-w-0 flex-1 flex-col overflow-hidden xl:max-w-[46%]">
        <div className="border-b border-line px-4 py-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setQuery((current) => ({ ...current, page: 1 }));
              }}
              placeholder="Filter this folder by subject, sender, tag or keyword"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <InboxToolbar
          title={title}
          total={data?.total ?? 0}
          query={effectiveQuery}
          categories={filters?.categories ?? []}
          onChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
          onRefresh={() => refetch()}
        />

        {selected.length > 0 && (
          <div className="flex items-center gap-2 border-b border-line bg-brand-50 px-4 py-2 text-xs text-brand-700">
            {selected.length} selected
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
              Clear selection
            </Button>
            <Button variant="secondary" size="sm">
              Assign owner
            </Button>
            <Button variant="primary" size="sm">
              Bulk approve
            </Button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <SkeletonRows rows={8} className="p-4" />
          ) : data?.items.length ? (
            data.items.map((email, index) => (
              <EmailListItem
                key={email.id}
                email={email}
                index={index}
                active={email.id === activeId}
                selected={selected.includes(email.id)}
                onSelect={() => setActiveId(email.id)}
                onToggle={() =>
                  setSelected((current) =>
                    current.includes(email.id)
                      ? current.filter((id) => id !== email.id)
                      : [...current, email.id],
                  )
                }
              />
            ))
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Nothing matches these filters"
              description="Clear the search term or widen the priority and category filters to see more of the mailbox."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTerm("");
                    setQuery({ page: 1, page_size: 20, sort: "priority" });
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          )}
        </div>

        <Pagination
          page={data?.page ?? 1}
          pages={data?.pages ?? 1}
          total={data?.total ?? 0}
          pageSize={data?.page_size ?? 20}
          onPage={(page) => setQuery((current) => ({ ...current, page }))}
          onPageSize={(page_size) => setQuery((current) => ({ ...current, page_size, page: 1 }))}
        />
      </section>

      <section className="panel hidden min-w-0 flex-1 overflow-hidden xl:flex">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex min-w-0 flex-1 flex-col"
            >
              <div className="flex items-center gap-2 border-b border-line bg-elevated px-5 py-2">
                <span className="font-mono text-2xs text-ink-subtle">{active.id}</span>
                {isFetching && <span className="text-2xs text-ink-subtle">syncing…</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => navigate(`/emails/${active.id}`)}
                >
                  <Maximize2 /> Open full record
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AnalysisPanel email={active} compact />
              </div>
            </motion.div>
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Select a message"
              description="Pick any message on the left and the analysis, extracted actions and draft response appear here."
            />
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
