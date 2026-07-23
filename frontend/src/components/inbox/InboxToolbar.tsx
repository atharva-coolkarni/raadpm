import { Filter, RotateCw, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { EmailQuery } from "@/types";

export function InboxToolbar({
  total,
  title,
  query,
  categories,
  onChange,
  onRefresh,
}: {
  total: number;
  title: string;
  query: EmailQuery;
  categories: string[];
  onChange: (patch: Partial<EmailQuery>) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
      <h2 className="text-sm font-semibold text-ink">
        {title} <span className="font-normal text-ink-subtle">({total})</span>
      </h2>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-2xs font-medium text-ink-subtle">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Sort
          <Select
            value={query.sort ?? "priority"}
            onChange={(event) => onChange({ sort: event.target.value as EmailQuery["sort"], page: 1 })}
          >
            <option value="priority">Priority</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="risk">Risk score</option>
            <option value="confidence">Confidence</option>
          </Select>
        </label>

        <label className="flex items-center gap-1.5 text-2xs font-medium text-ink-subtle">
          <Filter className="h-3.5 w-3.5" /> Priority
          <Select
            value={query.priority ?? ""}
            onChange={(event) => onChange({ priority: event.target.value || undefined, page: 1 })}
          >
            <option value="">All</option>
            <option value="P1">P1 Critical</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Medium</option>
            <option value="P4">P4 Low</option>
          </Select>
        </label>

        <Select
          value={query.category ?? ""}
          onChange={(event) => onChange({ category: event.target.value || undefined, page: 1 })}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh inbox">
          <RotateCw />
        </Button>
      </div>
    </div>
  );
}
