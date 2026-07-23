import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  CheckSquare,
  Clock,
  FileClock,
  Flag,
  Inbox,
  LayoutDashboard,
  Mail,
  MailOpen,
  Network,
  RefreshCw,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Siren,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Inbox;
  countKey?: string;
  accent?: string;
}

const PRIMARY: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inbox", label: "Inbox", icon: Inbox, countKey: "inbox" },
  {
    to: "/inbox/high-priority",
    label: "High priority",
    icon: AlertTriangle,
    countKey: "high-priority",
    accent: "text-critical-base",
  },
  { to: "/tasks", label: "Actions", icon: CheckSquare, countKey: "actions" },
  {
    to: "/inbox/audit-compliance",
    label: "Audit & compliance",
    icon: ShieldCheck,
    countKey: "audit-compliance",
  },
  { to: "/inbox/security", label: "Security", icon: Shield, countKey: "security" },
  { to: "/inbox/infrastructure", label: "Infrastructure", icon: Network, countKey: "infrastructure" },
  {
    to: "/inbox/change-management",
    label: "Change management",
    icon: RefreshCw,
    countKey: "change-management",
  },
  { to: "/inbox/incidents", label: "Incidents", icon: Siren, countKey: "incidents" },
];

const SECONDARY: NavItem[] = [
  { to: "/analysis", label: "AI analysis", icon: Bot },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/knowledge-base", label: "Knowledge base", icon: BookOpen },
  { to: "/audit-logs", label: "Audit logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

const QUICK_FILTERS: NavItem[] = [
  { to: "/inbox/unread", label: "Unread", icon: MailOpen, countKey: "unread" },
  { to: "/inbox/flagged", label: "Flagged", icon: Flag, countKey: "flagged" },
  { to: "/inbox/sla-risk", label: "SLA at risk", icon: Clock, countKey: "sla-risk" },
  { to: "/inbox/overdue", label: "Overdue", icon: FileClock, countKey: "overdue" },
];

function CountChip({ value, accent }: { value?: number; accent?: string }) {
  if (value === undefined) return null;
  return (
    <span
      className={cn(
        "ml-auto rounded bg-white/10 px-1.5 py-0.5 text-2xs font-semibold tabular-nums text-white/70",
        accent && "bg-critical-base/20 text-critical-soft",
      )}
    >
      {value}
    </span>
  );
}

function NavRow({ item, count }: { item: NavItem; count?: number }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/" || item.to === "/inbox"}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white/90",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r bg-brand-400"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <Icon className={cn("h-4 w-4 shrink-0", item.accent)} />
          <span className="truncate">{item.label}</span>
          <CountChip value={count} accent={item.accent} />
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const { data: counts } = useQuery({
    queryKey: ["email-counts"],
    queryFn: api.emailCounts,
    refetchInterval: 60000,
  });

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-white/5 bg-navy-900">
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          R
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">
            RAADPM <span className="text-brand-400">MailOps AI</span>
          </p>
          <p className="text-2xs text-white/45">Operational action intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {PRIMARY.map((item) => (
          <NavRow key={item.to} item={item} count={item.countKey ? counts?.[item.countKey] : undefined} />
        ))}

        <p className="px-3 pb-1 pt-4 text-2xs font-semibold uppercase tracking-wider text-white/35">
          Intelligence
        </p>
        {SECONDARY.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}

        <p className="px-3 pb-1 pt-4 text-2xs font-semibold uppercase tracking-wider text-white/35">
          Quick filters
        </p>
        {QUICK_FILTERS.map((item) => (
          <NavRow key={item.to} item={item} count={item.countKey ? counts?.[item.countKey] : undefined} />
        ))}
      </nav>

      <div className="m-2 rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-low-base opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-low-base" />
          </span>
          <p className="text-xs font-semibold text-white">AI assistant</p>
          <span className="ml-auto text-2xs text-white/40">Online</span>
        </div>
        <p className="mt-1.5 text-2xs leading-relaxed text-white/50">
          Ask about any message, owner, action or deadline in the operational mailbox.
        </p>
        <button
          onClick={() => navigate("/analysis")}
          className="mt-2.5 flex w-full items-center justify-between rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Ask RAADPM
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 px-4 pb-3 text-2xs text-white/35">
        <Mail className="h-3 w-3" />
        Last sync 2 min ago
      </div>
    </aside>
  );
}
