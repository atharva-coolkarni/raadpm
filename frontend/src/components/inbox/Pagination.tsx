import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  total,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const windowed = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pages || Math.abs(value - page) <= 1,
  );

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
      <p className="text-2xs text-ink-subtle">
        {from}–{to} of {total}
      </p>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {windowed.map((value, index) => (
          <span key={value} className="flex items-center">
            {index > 0 && windowed[index - 1] !== value - 1 && (
              <span className="px-1 text-2xs text-ink-subtle">…</span>
            )}
            <button
              onClick={() => onPage(value)}
              className={cn(
                "h-7 min-w-7 rounded px-2 text-xs font-medium transition-colors",
                value === page
                  ? "bg-brand-600 text-white"
                  : "text-ink-muted hover:bg-slate-100 hover:text-ink",
              )}
            >
              {value}
            </button>
          </span>
        ))}
        <Button
          variant="ghost"
          size="icon"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
        <label className="ml-2 flex items-center gap-1.5 text-2xs text-ink-subtle">
          Rows
          <Select value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))}>
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}
