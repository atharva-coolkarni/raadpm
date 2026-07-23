import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CircleHelp, Command, Search, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { CURRENT_USER } from "@/lib/constants";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { cn } from "@/lib/utils";

export function Topbar() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: health } = useQuery({ queryKey: ["health"], queryFn: api.health });
  const { data: results } = useQuery({
    queryKey: ["search", term],
    queryFn: () => api.emails({ q: term, page_size: 6 }),
    enabled: term.trim().length > 1,
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-4 border-b border-white/5 bg-navy-800 px-4">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder="Search emails, actions, owners, keywords"
          className="h-9 w-full rounded-md border border-white/10 bg-white/[0.06] pl-9 pr-16 text-sm text-white placeholder:text-white/40 focus:border-brand-400/60 focus:bg-white/[0.09]"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-2xs text-white/40">
          <Command className="h-3 w-3" />K
        </span>

        <AnimatePresence>
          {open && term.trim().length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 right-0 top-11 overflow-hidden rounded-lg border border-line bg-surface shadow-panel"
            >
              {results?.items.length ? (
                <>
                  <p className="border-b border-line px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-ink-subtle">
                    {results.total} matching messages
                  </p>
                  {results.items.map((email) => (
                    <button
                      key={email.id}
                      onMouseDown={() => navigate(`/emails/${email.id}`)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <PriorityBadge priority={email.priority} showLabel={false} />
                      <span className="flex-1 truncate text-sm text-ink">{email.subject}</span>
                      <span className="text-2xs text-ink-subtle">{email.category}</span>
                    </button>
                  ))}
                </>
              ) : (
                <p className="px-3 py-4 text-sm text-ink-muted">
                  No messages match “{term}”. Try an owner, category or keyword such as UPI.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className={cn(
            "hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-2xs font-semibold md:inline-flex",
            health
              ? "border-low-base/30 bg-low-base/10 text-low-soft"
              : "border-critical-base/30 bg-critical-base/10 text-critical-soft",
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {health ? `Secure session · ${health.ai_mode} engine` : "API offline"}
        </span>

        <button className="relative rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-critical-base text-[9px] font-bold text-white">
            6
          </span>
        </button>
        <button className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white">
          <CircleHelp className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {CURRENT_USER.initials}
          </div>
          <div className="hidden leading-tight lg:block">
            <p className="text-xs font-semibold text-white">{CURRENT_USER.name}</p>
            <p className="text-2xs text-white/45">{CURRENT_USER.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
