import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint, NamedValue, ResolutionPoint } from "@/types";
import { CHART_COLORS, PRIORITY_COLORS } from "@/lib/constants";

const AXIS = {
  tick: { fontSize: 11, fill: "#64748B" },
  axisLine: { stroke: "#E2E8F0" },
  tickLine: false,
} as const;

const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 12,
    boxShadow: "0 8px 20px -6px rgba(16,24,40,.15)",
  },
  labelStyle: { fontWeight: 600, color: "#0F1E33" },
} as const;

export function PriorityDonut({ data }: { data: NamedValue[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="relative h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={84}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? "#94A3B8"} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend
            verticalAlign="bottom"
            height={24}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-ink-muted">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-0 right-0 top-[38%] -translate-y-1/2 text-center">
        <p className="text-2xl font-semibold tabular-nums text-ink">{total}</p>
        <p className="text-2xs text-ink-subtle">messages</p>
      </div>
    </div>
  );
}

export function CategoryBars({ data }: { data: NamedValue[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#EEF2F6" />
        <XAxis type="number" {...AXIS} />
        <YAxis type="category" dataKey="name" width={128} {...AXIS} />
        <Tooltip cursor={{ fill: "#F1F5F9" }} {...TOOLTIP_STYLE} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyTrendArea({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="received" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D56D6" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#1D56D6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#067647" stopOpacity={0.24} />
            <stop offset="100%" stopColor="#067647" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EEF2F6" />
        <XAxis dataKey="date" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs capitalize text-ink-muted">{value}</span>}
        />
        <Area
          type="monotone"
          dataKey="received"
          name="Received"
          stroke="#1D56D6"
          strokeWidth={2}
          fill="url(#received)"
        />
        <Area
          type="monotone"
          dataKey="auto_resolved"
          name="Auto-resolved"
          stroke="#067647"
          strokeWidth={2}
          fill="url(#resolved)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ResolutionLine({ data }: { data: ResolutionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#EEF2F6" />
        <XAxis dataKey="date" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-ink-muted">{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="avg_minutes"
          name="Avg resolution (min)"
          stroke="#DC6803"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="sla_met_pct"
          name="SLA met (%)"
          stroke="#1D56D6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBars({ data, color = "#1D56D6" }: { data: NamedValue[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#EEF2F6" />
        <XAxis dataKey="name" interval={0} height={54} angle={-18} textAnchor="end" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip cursor={{ fill: "#F1F5F9" }} {...TOOLTIP_STYLE} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} barSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
