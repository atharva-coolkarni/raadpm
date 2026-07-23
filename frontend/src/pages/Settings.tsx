import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Database, Server, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  description,
  checked,
  locked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-line py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p>
      </div>
      {locked ? (
        <Badge tone="success">
          <ShieldCheck className="h-3 w-3" /> Locked on
        </Badge>
      ) : (
        <button
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={onChange}
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors",
            checked ? "bg-brand-600" : "bg-slate-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: api.health });
  const [threshold, setThreshold] = useState(80);
  const [toggles, setToggles] = useState({
    duplicates: true,
    autoRoute: true,
    slaAlerts: true,
    digest: false,
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Prototype configuration. Responsible AI controls are fixed on by design."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-brand-600" /> Analysis engine
              </CardTitle>
              <CardDescription>Where triage decisions come from</CardDescription>
            </div>
            <Badge tone={health?.ai_mode === "llm" ? "brand" : "neutral"}>
              {health?.ai_mode ?? "checking"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-line bg-elevated p-3">
              <p className="text-sm text-ink">
                Provider: <span className="font-semibold">{health?.ai_provider ?? "none"}</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                With no API key present the deterministic rule engine runs every decision, so the
                demo works offline. Set RAADPM_AI_PROVIDER and the matching key in the backend
                environment to switch to a free-tier model. If that call fails, triage falls back to
                rules automatically.
              </p>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-ink">Auto-send confidence threshold</p>
                <span className="text-sm font-semibold tabular-nums text-ink">{threshold}%</span>
              </div>
              <p className="mb-2 text-xs text-ink-muted">
                Below this score a human must approve the draft before anything is sent.
              </p>
              <input
                type="range"
                min={50}
                max={99}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
                className="w-full accent-brand-600"
                aria-label="Auto-send confidence threshold"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-low-base" /> Responsible AI
              </CardTitle>
              <CardDescription>Guardrails that cannot be turned off in this build</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="py-0">
            <Toggle
              label="PII masking before analysis"
              description="Account numbers, cards, phone numbers, email addresses and PAN are masked locally before any model sees the text."
              checked
              locked
              onChange={() => undefined}
            />
            <Toggle
              label="Human approval for P1 and P2"
              description="Critical and high severity drafts always need a named approver."
              checked
              locked
              onChange={() => undefined}
            />
            <Toggle
              label="Reasoning on every decision"
              description="Each classification records the signals that produced it."
              checked
              locked
              onChange={() => undefined}
            />
            <Toggle
              label="Immutable audit trail"
              description="Approvals, edits, rejections and overrides are appended to the audit log."
              checked
              locked
              onChange={() => undefined}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Triage behaviour</CardTitle>
              <CardDescription>Prototype preferences, stored in the session</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="py-0">
            <Toggle
              label="Merge duplicate threads"
              description="Group repeat reports of the same issue into one record."
              checked={toggles.duplicates}
              onChange={() => setToggles((t) => ({ ...t, duplicates: !t.duplicates }))}
            />
            <Toggle
              label="Auto-route to suggested owner"
              description="Assign the recommended team as soon as a message is classified."
              checked={toggles.autoRoute}
              onChange={() => setToggles((t) => ({ ...t, autoRoute: !t.autoRoute }))}
            />
            <Toggle
              label="SLA breach alerts"
              description="Raise a banner when a message passes its response target."
              checked={toggles.slaAlerts}
              onChange={() => setToggles((t) => ({ ...t, slaAlerts: !t.slaAlerts }))}
            />
            <Toggle
              label="Daily digest email"
              description="Send a morning summary of open critical items to the operations lead."
              checked={toggles.digest}
              onChange={() => setToggles((t) => ({ ...t, digest: !t.digest }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-brand-600" /> Data source
              </CardTitle>
              <CardDescription>JSON files on disk, no database</CardDescription>
            </div>
            <Badge tone={health ? "success" : "danger"}>
              <Server className="h-3 w-3" /> {health ? "API connected" : "API offline"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {health &&
              Object.entries(health.records).map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="capitalize text-ink">{name}</span>
                    <span className="font-semibold tabular-nums text-ink">{count}</span>
                  </div>
                  <Progress value={Math.min(100, (count / 100) * 100)} className="mt-1" />
                </div>
              ))}
            <p className="text-xs leading-relaxed text-ink-muted">
              All records are synthetic. Regenerate the corpus any time with{" "}
              <code className="font-mono text-2xs">python generate_data.py</code> in the backend
              folder.
            </p>
            <Button variant="secondary" onClick={() => window.open("http://127.0.0.1:8000/docs", "_blank")}>
              Open API docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
